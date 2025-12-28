import { eq, and, sql } from 'drizzle-orm'
import { GmailService } from './gmail.service'
import { ClaudeService } from './claude.service'
import { FeatureMatcherService } from './feature-matcher.service'
import { ContactService } from './contact.service'
import { MessageTransformerService } from './message-transformer.service'
import { getDb, schema } from '../db'
import type { GmailConnection } from '../db/schema/gmail-connections'

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
    const claudeService = new ClaudeService()

    // Get new message IDs since last history
    const messageIds = await gmailService.getHistoryChanges(connection.historyId)

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
          claudeService,
          products
        )
      } catch (error) {
        console.error(`Error processing message ${messageId}:`, error)
      }
    }
  }

  /**
   * Process a single email by ID (public method for manual sync)
   */
  static async processSingleEmail(
    connection: GmailConnection,
    messageId: string,
    products: Array<{ id: string; name: string; userId: string; emailFilter: string | null }>
  ): Promise<void> {
    const gmailService = new GmailService(connection.accessToken, connection.refreshToken)
    const claudeService = new ClaudeService()

    await EmailProcessorService.processEmail(
      messageId,
      connection,
      gmailService,
      claudeService,
      products
    )
  }

  /**
   * Process a single email
   */
  private static async processEmail(
    messageId: string,
    connection: GmailConnection,
    gmailService: GmailService,
    claudeService: ClaudeService,
    products: Array<{ id: string; name: string; userId: string; emailFilter: string | null }>
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
    const message = await gmailService.getMessage(messageId)
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

    // Check if it's a feature request
    console.log('email Content', emailContent);
    const isFeatureRequest = await claudeService.isFeatureRequest(emailContent)

    // Record that we processed this message (store content for later feedback creation)
    const [processedMessage] = await db.insert(schema.processedMessages).values({
      productId: targetProduct.id,
      source: 'gmail',
      sourceMessageId: normalized.sourceId,
      sourceThreadId: normalized.sourceThreadId,
      subject: normalized.subject,
      senderEmail: normalized.sender.email,
      senderName: normalized.sender.name,
      content: normalized.content,
      isFeatureRequest,
    }).returning()

    if (!isFeatureRequest) {
      console.log(`Message ${messageId} is not a feature request`)
      return
    }

    console.log(`Message ${messageId} is a feature request, extracting...`)

    // Extract the feature request
    const extracted = await claudeService.extractFeatureRequest(emailContent)
    if (!extracted) {
      console.error(`Failed to extract feature request from message ${messageId}`)
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
      ? await ContactService.findOrCreate(targetProduct.userId, normalized.sender.email, normalized.sender.name)
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
        sourceEmailId: normalized.sourceId,
      }).returning()

      // Always create initial feedback to track the requester
      const [newFeedback] = await db.insert(schema.feedback).values({
        productId: targetProduct.id,
        featureRequestId: newRequest.id,
        contactId: contact?.id,
        content: normalized.content,
        sentiment: extracted.sentiment,
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
    }
  }
}
