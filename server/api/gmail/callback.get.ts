import { eq } from 'drizzle-orm'
import { GmailService } from '../../services/gmail.service'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { badRequest } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const query = getQuery(event)
  const config = useRuntimeConfig()

  const code = query.code as string
  const error = query.error as string

  if (error) {
    return sendRedirect(event, '/settings/gmail?error=' + encodeURIComponent(error))
  }

  if (!code) {
    badRequest('Authorization code is required')
  }

  try {
    // Exchange code for tokens
    const tokens = await GmailService.exchangeCodeForTokens(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return sendRedirect(event, '/settings/gmail?error=missing_tokens')
    }

    // Create Gmail service to get user email and setup watch
    const gmailService = new GmailService(tokens.access_token, tokens.refresh_token)
    const email = await gmailService.getUserEmail()

    if (!email) {
      return sendRedirect(event, '/settings/gmail?error=email_fetch_failed')
    }

    // Setup Gmail watch for push notifications (optional - may fail in dev without Pub/Sub)
    let watchResult = null
    try {
      watchResult = await gmailService.setupWatch(config.googlePubsubTopic)
    } catch (watchError) {
      console.warn('Gmail watch setup failed (this is OK for local dev):', watchError)
    }

    // Get current historyId for sync (even if watch failed)
    let historyId = watchResult?.historyId || null
    if (!historyId) {
      const profile = await gmailService.getProfile()
      historyId = profile?.historyId || null
    }

    // Get user's product
    const product = await db.query.products.findFirst({
      where: eq(schema.products.userId, user.id),
    })

    if (!product) {
      return sendRedirect(event, '/settings/gmail?error=no_product')
    }

    // Check for existing connection and update or create
    const existingConnection = await db.query.gmailConnections.findFirst({
      where: eq(schema.gmailConnections.productId, product.id),
    })

    const connectionData = {
      email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: new Date(Date.now() + (tokens.expiry_date || 3600000)),
      watchExpiration: watchResult?.expiration || null,
      historyId,
      isActive: true,
      updatedAt: new Date(),
    }

    if (existingConnection) {
      await db
        .update(schema.gmailConnections)
        .set(connectionData)
        .where(eq(schema.gmailConnections.id, existingConnection.id))
    } else {
      await db.insert(schema.gmailConnections).values({
        productId: product.id,
        ...connectionData,
      })
    }

    return sendRedirect(event, '/settings/gmail?success=true')
  } catch (error) {
    console.error('Gmail callback error:', error)
    return sendRedirect(event, '/settings/gmail?error=connection_failed')
  }
})
