import { eq, and, sql } from 'drizzle-orm'
import { GmailService } from './gmail.service'
import { ClaudeService } from './claude.service'
import { FeatureMatcherService } from './feature-matcher.service'
import { ContactService } from './contact.service'
import { MessageTransformerService } from './message-transformer.service'
import { getDb, schema } from '../db'
import type { GmailConnection } from '../db/schema/gmail-connections'
import type { GmailMessage } from '~~/shared/types'
import type { Status } from '~~/shared/constants'

export class EmailProcessorService {
  /**
   * Process new emails for a Gmail connection since the given history ID
   */
  static async processNewEmails(
    connection: GmailConnection,
    newHistoryId: string
  ): Promise<void> {
    const db = getDb()

    if (!connection.historyId) {
      console.log('No previous history ID, skipping processing')
      return
    }

    const gmailService = new GmailService(connection.accessToken, connection.refreshToken)

    // Get new message IDs since last history
    let messageIds: string[] = []
    try {
      messageIds = await gmailService.getHistoryChanges(connection.historyId)
    } catch (error) {
      console.error('Failed to get history changes:', error)
      return
    }

    if (messageIds.length === 0) {
      console.log('No new messages to process')
      return
    }

    console.log(`Processing ${messageIds.length} new messages`)

    // Get the product for this connection
    const product = await db.query.products.findFirst({
      where: eq(schema.products.id, connection.productId),
    })

    if (!product) {
      console.error('Product not found for connection:', connection.id)
      return
    }

    const products = [product]

    // Process each message
    for (const messageId of messageIds) {
      try {
        await EmailProcessorService.processEmail(
          messageId,
          connection,
          gmailService,
          products
        )
      } catch (error) {
        console.error(`Error processing message ${messageId}:`, error)
        // Continue with next message
      }
    }
  }

  /**
   * Process a single email by ID (public method for manual sync)
   */
  static async processSingleEmail(
    connection: GmailConnection,
    messageId: string,
    products: Array<{ id: string; name: string; userId: string; emailFilter: string | null; autoDraftsEnabled: boolean }>
  ): Promise<void> {
    const gmailService = new GmailService(connection.accessToken, connection.refreshToken)

    await EmailProcessorService.processEmail(
      messageId,
      connection,
      gmailService,
      products
    )
  }

  /**
   * Process a single email
   * Designed to be resilient - saves processed message first, then attempts AI analysis
   */
  private static async processEmail(
    messageId: string,
    connection: GmailConnection,
    gmailService: GmailService,
    products: Array<{ id: string; name: string; userId: string; emailFilter: string | null; autoDraftsEnabled: boolean }>
  ): Promise<void> {
    const db = getDb()

    // Check if already processed (using unified processed_messages table)
    const existing = await db.query.processedMessages.findFirst({
      where: and(
        eq(schema.processedMessages.source, 'gmail'),
        eq(schema.processedMessages.sourceMessageId, messageId)
      ),
    })

    if (existing) {
      console.log(`Message ${messageId} already processed`)
      return
    }

    // Fetch the message
    let message: GmailMessage | null = null
    try {
      message = await gmailService.getMessage(messageId)
    } catch (error) {
      console.error(`Failed to fetch message ${messageId}:`, error)
      return
    }

    if (!message) {
      console.log(`Could not fetch message ${messageId}`)
      return
    }

    // Transform to normalized format
    const normalized = MessageTransformerService.fromGmail(message)

    // Create email content for analysis
    const emailContent = `Subject: ${normalized.subject}\nFrom: ${normalized.sender.email}\n\n${normalized.content}`

    // For now, use the first product (or implement smarter product matching based on emailFilter)
    const targetProduct = products[0]

    // STEP 1: Save processed message FIRST (before any AI analysis)
    // This ensures we have a record even if later steps fail
    const [processedMessage] = await db.insert(schema.processedMessages).values({
      productId: targetProduct.id,
      source: 'gmail',
      sourceMessageId: normalized.sourceId,
      sourceThreadId: normalized.sourceThreadId,
      subject: normalized.subject,
      senderEmail: normalized.sender.email,
      senderName: normalized.sender.name,
      content: normalized.content,
      isFeatureRequest: false, // Default to false, update later if detected
    }).returning()

    // STEP 2: Check if it's a feature request (wrapped in try/catch)
    let isFeatureRequest = false
    try {
      const claudeService = new ClaudeService()
      isFeatureRequest = await claudeService.isFeatureRequest(emailContent)
    } catch (error) {
      console.error(`Failed to check if message ${messageId} is a feature request:`, error)
      // Continue with isFeatureRequest = false
    }

    // Update the processed message with feature request status
    if (isFeatureRequest) {
      await db.update(schema.processedMessages)
        .set({ isFeatureRequest: true })
        .where(eq(schema.processedMessages.id, processedMessage.id))
    }

    if (!isFeatureRequest) {
      console.log(`Message ${messageId} is not a feature request`)
      return
    }

    console.log(`Message ${messageId} is a feature request, extracting...`)

    // STEP 3: Extract the feature request (wrapped in try/catch)
    const claudeService = new ClaudeService()
    let extracted = null
    try {
      extracted = await claudeService.extractFeatureRequest(emailContent)
    } catch (error) {
      console.error(`Failed to extract feature request from message ${messageId}:`, error)
    }

    if (!extracted) {
      console.error(`Could not extract feature request details from message ${messageId}`)
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
      console.error(`Failed to match feature request for message ${messageId}:`, error)
      // Continue without matching - will create new feature request
    }

    // STEP 5: Find or create contact for this sender (wrapped in try/catch)
    let contact = null
    try {
      if (normalized.sender.email) {
        contact = await ContactService.findOrCreate(targetProduct.id, normalized.sender.email, normalized.sender.name)
      }
    } catch (error) {
      console.error(`Failed to create contact for message ${messageId}:`, error)
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
          source: 'gmail',
          senderEmail: normalized.sender.email,
          senderName: normalized.sender.name,
          emailMessageId: normalized.sourceId,
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
        // This is non-blocking - failures don't affect the rest of processing
        if (targetProduct.autoDraftsEnabled) {
          EmailProcessorService.createDraftResponse(
            connection,
            message,
            normalized,
            {
              id: matchingRequest.id,
              title: matchingRequest.title,
              status: matchingRequest.status as Status,
            },
            targetProduct
          ).catch(error => {
            console.error(`Draft creation failed for message ${messageId}:`, error)
          })
        }
      } catch (error) {
        console.error(`Failed to create feedback for message ${messageId}:`, error)
        // Processed message is already saved, can be manually assigned later
      }
    } else {
      // Create a new feature request
      console.log(`Creating new feature request: ${extracted.title}`)

      try {
        const [newRequest] = await db.insert(schema.featureRequests).values({
          productId: targetProduct.id,
          title: extracted.title,
          description: extracted.description,
          originalContent: normalized.content,
          category: extracted.category,
          aiGenerated: true,
          sourceEmailId: normalized.sourceId,
        }).returning()

        // Always create initial feedback to track the requester
        const [newFeedback] = await db.insert(schema.feedback).values({
          productId: targetProduct.id,
          featureRequestId: newRequest.id,
          contactId: contact?.id,
          content: normalized.content,
          sentiment: extracted.sentiment,
          source: 'gmail',
          senderEmail: normalized.sender.email,
          senderName: normalized.sender.name,
          emailMessageId: normalized.sourceId,
          aiExtracted: true,
        }).returning()

        // Update processed message with references
        await db.update(schema.processedMessages)
          .set({
            featureRequestId: newRequest.id,
            feedbackId: newFeedback.id,
          })
          .where(eq(schema.processedMessages.id, processedMessage.id))
      } catch (error) {
        console.error(`Failed to create feature request for message ${messageId}:`, error)
        // Processed message is already saved, can be manually assigned later
      }
    }
  }

  /**
   * Create a draft response for a matched feature request
   * This is a best-effort operation - failures don't affect email processing
   */
  private static async createDraftResponse(
    connection: GmailConnection,
    originalMessage: GmailMessage,
    normalized: { sender: { email: string; name: string | null }; subject: string },
    matchingRequest: { id: string; title: string; status: Status },
    product: { name: string }
  ): Promise<void> {
    try {
      const claudeService = new ClaudeService()

      // Generate the draft response
      let draftText: string | null = null
      try {
        draftText = await claudeService.generateFeatureStatusDraft({
          customerName: normalized.sender.name,
          featureTitle: matchingRequest.title,
          featureStatus: matchingRequest.status,
          productName: product.name,
        })
      } catch (error) {
        console.error(`Failed to generate draft content for message ${originalMessage.id}:`, error)
        return
      }

      if (!draftText) {
        console.error(`Empty draft content for message ${originalMessage.id}`)
        return
      }

      // Create draft in Gmail
      try {
        const gmailService = new GmailService(connection.accessToken, connection.refreshToken)

        // Prepare reply subject (add Re: if not already present)
        const replySubject = normalized.subject.toLowerCase().startsWith('re:')
          ? normalized.subject
          : `Re: ${normalized.subject}`

        const draftId = await gmailService.createDraft({
          to: normalized.sender.email,
          subject: replySubject,
          body: draftText,
          threadId: originalMessage.threadId,
          inReplyTo: originalMessage.id,
        })

        if (draftId) {
          console.log(`Draft response created for message ${originalMessage.id}, draft ID: ${draftId}`)
        } else {
          console.warn(`Failed to create draft in Gmail for message ${originalMessage.id}`)
        }
      } catch (error) {
        console.error(`Gmail API error when creating draft for message ${originalMessage.id}:`, error)
        // Don't rethrow - this is non-fatal
      }
    } catch (error) {
      console.error('Unexpected error creating draft response:', error)
      // Non-fatal: don't fail the whole processing
    }
  }
}
