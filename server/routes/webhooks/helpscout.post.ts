import { eq } from 'drizzle-orm'
import { HelpScoutService } from '../../services/helpscout.service'
import { ConversationProcessorService } from '../../services/conversation-processor.service'
import { getDb, schema } from '../../db'
import type { HelpScoutWebhookPayload } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getDb()

  // Get raw body for signature verification
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      message: 'Empty request body',
    })
  }

  // Verify webhook signature if secret is configured
  if (config.helpscoutWebhookSecret) {
    const signature = getHeader(event, 'x-helpscout-signature')
    if (!signature) {
      throw createError({
        statusCode: 403,
        message: 'Missing signature',
      })
    }

    const isValid = HelpScoutService.verifyWebhook(rawBody, signature, config.helpscoutWebhookSecret)
    if (!isValid) {
      throw createError({
        statusCode: 403,
        message: 'Invalid signature',
      })
    }
  }

  const payload = JSON.parse(rawBody) as HelpScoutWebhookPayload

  console.log('Received Help Scout webhook, conversation:', payload.id)

  // Ensure we have a conversation ID
  if (!payload.id) {
    console.log('No conversation ID in webhook payload')
    return { received: true }
  }

  // Find a connection that can process this (we'll use the first active one for now)
  // In a multi-tenant scenario, you'd need to match based on mailbox or other criteria
  const connections = await db.query.helpscoutConnections.findMany({
    where: eq(schema.helpscoutConnections.isActive, true),
  })

  if (connections.length === 0) {
    console.log('No active Help Scout connections found')
    return { received: true }
  }

  // Process with the first active connection
  const connection = connections[0]

  try {
    // Get the user's products
    const products = await db.query.products.findMany({
      where: eq(schema.products.userId, connection.userId),
    })

    if (products.length === 0) {
      console.log('No products found for user:', connection.userId)
      return { received: true }
    }

    // Fetch full conversation and process
    const helpscoutService = new HelpScoutService(connection.accessToken, connection.refreshToken)
    const conversation = await helpscoutService.getConversation(payload.id)

    if (conversation) {
      await ConversationProcessorService.processConversation(connection, conversation, products)
    }
  } catch (error) {
    console.error('Error processing Help Scout webhook:', error)
    // Still return 200 to acknowledge receipt
  }

  return { received: true }
})
