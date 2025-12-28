import { eq } from 'drizzle-orm'
import { HelpScoutService } from '../../services/helpscout.service'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const query = getQuery(event)

  const code = query.code as string
  const error = query.error as string

  if (error) {
    return sendRedirect(event, '/settings/helpscout?error=' + encodeURIComponent(error))
  }

  if (!code) {
    return sendRedirect(event, '/settings/helpscout?error=missing_code')
  }

  try {
    // Exchange code for tokens
    const tokens = await HelpScoutService.exchangeCodeForTokens(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return sendRedirect(event, '/settings/helpscout?error=missing_tokens')
    }

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Get user's product
    const product = await db.query.products.findFirst({
      where: eq(schema.products.userId, user.id),
    })

    if (!product) {
      return sendRedirect(event, '/settings/helpscout?error=no_product')
    }

    // Check for existing connection and update or create
    const existingConnection = await db.query.helpscoutConnections.findFirst({
      where: eq(schema.helpscoutConnections.productId, product.id),
    })

    const connectionData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt,
      isActive: true,
      updatedAt: new Date(),
    }

    if (existingConnection) {
      await db
        .update(schema.helpscoutConnections)
        .set(connectionData)
        .where(eq(schema.helpscoutConnections.id, existingConnection.id))
    } else {
      await db.insert(schema.helpscoutConnections).values({
        productId: product.id,
        ...connectionData,
      })
    }

    return sendRedirect(event, '/settings/helpscout?success=true')
  } catch (error) {
    console.error('Help Scout callback error:', error)
    return sendRedirect(event, '/settings/helpscout?error=connection_failed')
  }
})
