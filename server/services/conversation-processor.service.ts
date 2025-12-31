import { HelpScoutService } from './helpscout.service'
import { ClaudeService } from './claude.service'
import { FeatureMatcherService } from './feature-matcher.service'
import { ContactService } from './contact.service'
import { MessageTransformerService } from './message-transformer.service'
import { getDb, schema } from '../db'
import { processedMessageRepository } from '../repositories/processed-message.repository'
import { featureRequestRepository } from '../repositories/feature-request.repository'
import type { HelpScoutConnection } from '../db/schema/helpscout-connections'
import type { HelpScoutConversation } from '~~/shared/types'
import type { Status } from '~~/shared/constants'

export class ConversationProcessorService {
  /**
   * Process a single Help Scout conversation
   * Designed to be resilient - saves processed message first, then attempts AI analysis
   */
  static async processConversation(
    connection: HelpScoutConnection,
    conversation: HelpScoutConversation,
    products: Array<{ id: string; name: string; userId: string; emailFilter: string | null; autoDraftsEnabled: boolean }>
  ): Promise<void> {
    const db = getDb()
    const conversationId = String(conversation.id)

    // Check if already processed (using unified processed_messages table)
    const existing = await processedMessageRepository.findBySourceId('helpscout', conversationId)

    if (existing) {
      console.log(`Conversation ${conversationId} already processed`)
      return
    }

    // Transform to normalized format
    const normalized = MessageTransformerService.fromHelpScout(conversation)

    const conversationContent = `Subject: ${normalized.subject}
From: ${normalized.sender.email}

${normalized.content}`

    console.log('Processing conversation:', conversation.subject)

    // Use the first product (or implement smarter product matching)
    const targetProduct = products[0]

    // STEP 1: Save processed message FIRST (before any AI analysis)
    // This ensures we have a record even if later steps fail
    const processedMessage = await processedMessageRepository.create({
      productId: targetProduct.id,
      source: 'helpscout',
      sourceMessageId: conversationId,
      subject: normalized.subject,
      senderEmail: normalized.sender.email,
      senderName: normalized.sender.name,
      content: normalized.content,
      isFeatureRequest: false, // Default to false, update later if detected
    })

    // STEP 2: Check if it's a feature request (wrapped in try/catch)
    let isFeatureRequest = false
    try {
      const claudeService = new ClaudeService()
      isFeatureRequest = await claudeService.isFeatureRequest(conversationContent)
    } catch (error) {
      console.error(`Failed to check if conversation ${conversationId} is a feature request:`, error)
      // Continue with isFeatureRequest = false
    }

    // Update the processed message with feature request status
    if (isFeatureRequest) {
      await processedMessageRepository.update(processedMessage.id, { isFeatureRequest: true })
    }

    if (!isFeatureRequest) {
      console.log(`Conversation ${conversationId} is not a feature request`)
      return
    }

    console.log(`Conversation ${conversationId} is a feature request, extracting...`)

    // STEP 3: Extract the feature request (wrapped in try/catch)
    const claudeService = new ClaudeService()
    let extracted = null
    try {
      extracted = await claudeService.extractFeatureRequest(conversationContent)
    } catch (error) {
      console.error(`Failed to extract feature request from conversation ${conversationId}:`, error)
    }

    if (!extracted) {
      console.error(`Could not extract feature request details from conversation ${conversationId}`)
      // Message is still saved for manual assignment later
      return
    }

    // STEP 4: Try to find a matching existing request (wrapped in try/catch)
    let matchingRequest = null
    try {
      matchingRequest = await FeatureMatcherService.findMatch(
        extracted,
        targetProduct.id,
        claudeService
      )
    } catch (error) {
      console.error(`Failed to match feature request for conversation ${conversationId}:`, error)
      // Continue without matching - will create new feature request
    }

    // STEP 5: Find or create contact for this sender (wrapped in try/catch)
    let contact = null
    try {
      if (normalized.sender.email) {
        contact = await ContactService.findOrCreate(targetProduct.id, normalized.sender.email, normalized.sender.name)
      }
    } catch (error) {
      console.error(`Failed to create contact for conversation ${conversationId}:`, error)
      // Continue without contact
    }

    // STEP 6: Create feedback and optionally feature request
    if (matchingRequest) {
      // Add as feedback to existing request
      console.log(`Adding feedback to existing request ${matchingRequest.id}`)

      try {
        const [newFeedback] = await db.insert(schema.feedback).values({
          productId: targetProduct.id,
          featureRequestId: matchingRequest.id,
          contactId: contact?.id,
          content: normalized.content,
          sentiment: extracted.sentiment,
          source: 'helpscout',
          senderEmail: normalized.sender.email,
          senderName: normalized.sender.name,
          emailMessageId: `helpscout-${conversationId}`,
          aiExtracted: true,
        }).returning()

        // Update processed message with feedback reference
        await processedMessageRepository.update(processedMessage.id, { feedbackId: newFeedback.id })

        // Increment feedback count
        await featureRequestRepository.incrementFeedbackCount(matchingRequest.id)

        // Generate and push draft response if auto-drafts enabled
        // This is non-blocking - failures don't affect the rest of processing
        if (targetProduct.autoDraftsEnabled) {
          ConversationProcessorService.createDraftResponse(
            connection,
            conversation,
            {
              id: matchingRequest.id,
              title: matchingRequest.title,
              status: matchingRequest.status as Status,
            },
            targetProduct,
            normalized.sender.name
          ).catch(error => {
            console.error(`Draft creation failed for conversation ${conversationId}:`, error)
          })
        }
      } catch (error) {
        console.error(`Failed to create feedback for conversation ${conversationId}:`, error)
        // Processed message is already saved, can be manually assigned later
      }
    } else {
      // Create a new feature request
      console.log(`Creating new feature request: ${extracted.title}`)

      try {
        const newRequest = await featureRequestRepository.create({
          productId: targetProduct.id,
          title: extracted.title,
          description: extracted.description,
          originalContent: normalized.content,
          category: extracted.category,
          aiGenerated: true,
          sourceEmailId: `helpscout-${conversationId}`,
        })

        // Always create initial feedback to track the requester
        const [newFeedback] = await db.insert(schema.feedback).values({
          productId: targetProduct.id,
          featureRequestId: newRequest.id,
          contactId: contact?.id,
          content: normalized.content,
          sentiment: extracted.sentiment,
          source: 'helpscout',
          senderEmail: normalized.sender.email,
          senderName: normalized.sender.name,
          emailMessageId: `helpscout-${conversationId}`,
          aiExtracted: true,
        }).returning()

        // Update processed message with references
        await processedMessageRepository.update(processedMessage.id, {
          featureRequestId: newRequest.id,
          feedbackId: newFeedback.id,
        })
      } catch (error) {
        console.error(`Failed to create feature request for conversation ${conversationId}:`, error)
        // Processed message is already saved, can be manually assigned later
      }
    }
  }

  /**
   * Create a draft response for a matched feature request
   * This is a best-effort operation - failures don't affect conversation processing
   */
  private static async createDraftResponse(
    connection: HelpScoutConnection,
    conversation: HelpScoutConversation,
    matchingRequest: { id: string; title: string; status: Status },
    product: { name: string },
    customerName: string | null
  ): Promise<void> {
    try {
      const claudeService = new ClaudeService()

      // Generate the draft response
      let draftText: string | null = null
      try {
        draftText = await claudeService.generateFeatureStatusDraft({
          customerName,
          featureTitle: matchingRequest.title,
          featureStatus: matchingRequest.status,
          productName: product.name,
        })
      } catch (error) {
        console.error(`Failed to generate draft content for conversation ${conversation.id}:`, error)
        return
      }

      if (!draftText) {
        console.error(`Empty draft content for conversation ${conversation.id}`)
        return
      }

      // Push to HelpScout - handle token issues gracefully
      try {
        const helpscoutService = new HelpScoutService(connection.accessToken, connection.refreshToken)
        const success = await helpscoutService.createDraftReply({
          conversationId: conversation.id,
          customerEmail: conversation.primaryCustomer.email,
          text: draftText,
        })

        if (success) {
          console.log(`Draft response created for conversation ${conversation.id}`)
        } else {
          console.warn(`Failed to push draft to HelpScout for conversation ${conversation.id}`)
        }
      } catch (error) {
        console.error(`HelpScout API error when creating draft for conversation ${conversation.id}:`, error)
        // Don't rethrow - this is non-fatal
      }
    } catch (error) {
      console.error('Unexpected error creating draft response:', error)
      // Non-fatal: don't fail the whole processing
    }
  }

  /**
   * Process all new conversations for a connection
   */
  static async processNewConversations(
    connection: HelpScoutConnection,
    products: Array<{ id: string; name: string; userId: string; emailFilter: string | null; autoDraftsEnabled: boolean }>
  ): Promise<number> {
    const helpscoutService = new HelpScoutService(connection.accessToken, connection.refreshToken)

    // Get recent conversations
    const conversations = await helpscoutService.getRecentConversations(undefined, 20)

    let processed = 0
    for (const conversation of conversations) {
      const existing = await processedMessageRepository.findBySourceId('helpscout', String(conversation.id))

      if (!existing) {
        // Fetch full conversation with threads
        const fullConversation = await helpscoutService.getConversation(conversation.id)
        if (fullConversation) {
          await ConversationProcessorService.processConversation(connection, fullConversation, products)
          processed++
        }
      }
    }

    return processed
  }
}
