import { eq, and } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { HelpScoutService } from '../../services/helpscout.service'
import { ConversationProcessorService } from '../../services/conversation-processor.service'

/**
 * Manually trigger Help Scout sync - fetch recent conversations and process them
 * POST /api/helpscout/sync
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

  // Get Help Scout connection for this product
  const connection = await db.query.helpscoutConnections.findFirst({
    where: eq(schema.helpscoutConnections.productId, product.id),
  })

  if (!connection || !connection.isActive) {
    throw createError({
      statusCode: 400,
      message: 'No active Help Scout connection found',
    })
  }

  const helpscoutService = new HelpScoutService(connection.accessToken, connection.refreshToken)

  // Get recent conversations
  const conversations = await helpscoutService.getRecentConversations(undefined, 10)

  if (conversations.length === 0) {
    return {
      data: {
        processed: 0,
        message: 'No conversations to process',
      },
    }
  }

  // Use the product we already have
  const products = [product]

  let processed = 0
  for (const conversation of conversations) {
    // Check if already processed (using unified processed_messages table)
    const existing = await db.query.processedMessages.findFirst({
      where: and(
        eq(schema.processedMessages.source, 'helpscout'),
        eq(schema.processedMessages.sourceMessageId, String(conversation.id))
      ),
    })

    if (!existing) {
      await ConversationProcessorService.processConversation(
        connection,
        conversation,
        products
      )
      processed++
    }
  }

  // Update last sync time
  await db
    .update(schema.helpscoutConnections)
    .set({ updatedAt: new Date() })
    .where(eq(schema.helpscoutConnections.id, connection.id))

  return {
    data: {
      processed,
      message: `Processed ${processed} new conversation(s)`,
    },
  }
})
