import { eq, and } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { GmailService } from '../../services/gmail.service'
import { EmailProcessorService } from '../../services/email-processor.service'

/**
 * Manually trigger email sync - useful for local development without Pub/Sub
 * POST /api/gmail/sync
 */
export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  // Get user's product
  const product = await db.query.products.findFirst({
    where: eq(schema.products.userId, user.id),
  })

  if (!product) {
    throw createError({
      statusCode: 400,
      message: 'No product found. Create a product first.',
    })
  }

  // Get Gmail connection for this product
  const connection = await db.query.gmailConnections.findFirst({
    where: eq(schema.gmailConnections.productId, product.id),
  })

  if (!connection || !connection.isActive) {
    throw createError({
      statusCode: 400,
      message: 'No active Gmail connection found',
    })
  }

  const gmailService = new GmailService(connection.accessToken, connection.refreshToken)

  // Get current historyId FIRST (before processing) - this will be our new checkpoint
  const profile = await gmailService.getProfile()
  const newHistoryId = profile?.historyId

  if (!newHistoryId) {
    throw createError({
      statusCode: 500,
      message: 'Failed to get Gmail profile',
    })
  }

  // If no previous historyId, this is first sync - save current historyId as starting point
  // (only new emails from this point forward will be synced)
  if (!connection.historyId) {
    await db
      .update(schema.gmailConnections)
      .set({
        historyId: newHistoryId,
        updatedAt: new Date(),
      })
      .where(eq(schema.gmailConnections.id, connection.id))

    return {
      data: {
        processed: 0,
        message: 'Gmail sync initialized. New emails will be processed on next sync.',
      },
    }
  }

  // Get message IDs that changed since our last historyId
  const messageIds = await gmailService.getHistoryChanges(connection.historyId)

  // Update historyId BEFORE processing to prevent re-fetching if user leaves mid-sync
  await db
    .update(schema.gmailConnections)
    .set({
      historyId: newHistoryId,
      updatedAt: new Date(),
    })
    .where(eq(schema.gmailConnections.id, connection.id))

  if (messageIds.length === 0) {
    return {
      data: {
        processed: 0,
        message: 'No new emails to process',
      },
    }
  }

  // Use the product we already have (include autoDraftsEnabled for draft creation)
  const products = [{
    id: product.id,
    name: product.name,
    userId: product.userId,
    emailFilter: product.emailFilter,
    autoDraftsEnabled: product.autoDraftsEnabled,
  }]

  // Process each new message
  let processed = 0
  for (const messageId of messageIds) {
    // Check if already processed (using unified processed_messages table)
    const existing = await db.query.processedMessages.findFirst({
      where: and(
        eq(schema.processedMessages.source, 'gmail'),
        eq(schema.processedMessages.sourceMessageId, messageId)
      ),
    })

    if (!existing) {
      try {
        await EmailProcessorService.processSingleEmail(connection, messageId, products)
        processed++
      } catch (error) {
        console.error(`Error processing message ${messageId}:`, error)
      }
    }
  }

  return {
    data: {
      processed,
      total: messageIds.length,
      message: `Processed ${processed} new email(s)`,
    },
  }
})
