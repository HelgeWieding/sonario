import { eq, and, sql } from 'drizzle-orm'
import { HelpScoutService } from './helpscout.service'
import { ClaudeService } from './claude.service'
import { FeatureMatcherService } from './feature-matcher.service'
import { ContactService } from './contact.service'
import { MessageTransformerService } from './message-transformer.service'
import { getDb, schema } from '../db'
import type { HelpScoutConnection } from '../db/schema/helpscout-connections'
import type { HelpScoutConversation } from '~~/shared/types'
import type { Status } from '~~/shared/constants'

export class ConversationProcessorService {
  /**
   * Process a single Help Scout conversation
   */
  static async processConversation(
    connection: HelpScoutConnection,
    conversation: HelpScoutConversation,
    products: Array<{ id: string; name: string; userId: string; emailFilter: string | null; autoDraftsEnabled: boolean }>
  ): Promise<void> {
    const db = getDb()
    const conversationId = String(conversation.id)

    // Check if already processed (using unified processed_messages table)
    const existing = await db.query.processedMessages.findFirst({
      where: and(
        eq(schema.processedMessages.source, 'helpscout'),
        eq(schema.processedMessages.sourceMessageId, conversationId)
      ),
    })

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

    // Check if it's a feature request
    const claudeService = new ClaudeService()
    const isFeatureRequest = await claudeService.isFeatureRequest(conversationContent)

    // Record that we processed this message (store content for later feedback creation)
    const [processedMessage] = await db.insert(schema.processedMessages).values({
      productId: targetProduct.id,
      source: 'helpscout',
      sourceMessageId: conversationId,
      subject: normalized.subject,
      senderEmail: normalized.sender.email,
      senderName: normalized.sender.name,
      content: normalized.content,
      isFeatureRequest,
    }).returning()

    if (!isFeatureRequest) {
      console.log(`Conversation ${conversationId} is not a feature request`)
      return
    }

    console.log(`Conversation ${conversationId} is a feature request, extracting...`)

    // Extract the feature request
    const extracted = await claudeService.extractFeatureRequest(conversationContent)
    if (!extracted) {
      console.error(`Failed to extract feature request from conversation ${conversationId}`)
      return
    }

    // Try to find a matching existing request
    const matchingRequest = await FeatureMatcherService.findMatch(
      extracted,
      targetProduct.id,
      claudeService
    )

    // Find or create contact for this sender
    const contact = normalized.sender.email
      ? await ContactService.findOrCreate(targetProduct.id, normalized.sender.email, normalized.sender.name)
      : null

    if (matchingRequest) {
      // Add as feedback to existing request
      console.log(`Adding feedback to existing request ${matchingRequest.id}`)

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
      await db.update(schema.processedMessages)
        .set({ feedbackId: newFeedback.id })
        .where(eq(schema.processedMessages.id, processedMessage.id))

      // Increment feedback count
      await db
        .update(schema.featureRequests)
        .set({
          feedbackCount: sql`${schema.featureRequests.feedbackCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.featureRequests.id, matchingRequest.id))

      // Generate and push draft response if auto-drafts enabled
      if (targetProduct.autoDraftsEnabled) {
        await ConversationProcessorService.createDraftResponse(
          connection,
          conversation,
          {
            id: matchingRequest.id,
            title: matchingRequest.title,
            description: matchingRequest.description,
            status: matchingRequest.status as Status,
            feedbackCount: matchingRequest.feedbackCount + 1, // Include the new feedback
          },
          targetProduct,
          normalized.sender.name
        )
      }
    } else {
      // Create a new feature request
      console.log(`Creating new feature request: ${extracted.title}`)

      const [newRequest] = await db.insert(schema.featureRequests).values({
        productId: targetProduct.id,
        title: extracted.title,
        description: extracted.description,
        originalContent: normalized.content,
        category: extracted.category,
        aiGenerated: true,
        sourceEmailId: `helpscout-${conversationId}`,
      }).returning()

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
      await db.update(schema.processedMessages)
        .set({
          featureRequestId: newRequest.id,
          feedbackId: newFeedback.id,
        })
        .where(eq(schema.processedMessages.id, processedMessage.id))
    }
  }

  /**
   * Create a draft response for a matched feature request
   */
  private static async createDraftResponse(
    connection: HelpScoutConnection,
    conversation: HelpScoutConversation,
    matchingRequest: { id: string; title: string; description: string; status: Status; feedbackCount: number },
    product: { name: string },
    customerName: string | null
  ): Promise<void> {
    try {
      const claudeService = new ClaudeService()
      const helpscoutService = new HelpScoutService(connection.accessToken, connection.refreshToken)

      // Generate the draft response
      const draftText = await claudeService.generateFeatureStatusDraft({
        customerName,
        featureTitle: matchingRequest.title,
        featureDescription: matchingRequest.description,
        featureStatus: matchingRequest.status,
        feedbackCount: matchingRequest.feedbackCount,
        productName: product.name,
      })

      if (!draftText) {
        console.error(`Failed to generate draft for conversation ${conversation.id}`)
        return
      }

      // Push to HelpScout
      const success = await helpscoutService.createDraftReply({
        conversationId: conversation.id,
        customerEmail: conversation.primaryCustomer.email,
        text: draftText,
      })

      if (success) {
        console.log(`Draft response created for conversation ${conversation.id}`)
      }
    } catch (error) {
      console.error('Error creating draft response:', error)
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
    const db = getDb()

    // Get recent conversations
    const conversations = await helpscoutService.getRecentConversations(undefined, 20)

    let processed = 0
    for (const conversation of conversations) {
      const existing = await db.query.processedMessages.findFirst({
        where: and(
          eq(schema.processedMessages.source, 'helpscout'),
          eq(schema.processedMessages.sourceMessageId, String(conversation.id))
        ),
      })

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
