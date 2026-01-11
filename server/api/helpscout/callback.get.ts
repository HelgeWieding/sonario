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

  // Get user's product first to know where to redirect
  const product = await db.query.products.findFirst({
    where: eq(schema.products.userId, user.id),
  })

  // Fallback redirect if no product found
  const settingsUrl = product ? `/${product.slug}/settings/helpscout` : '/dashboard'

  if (error) {
    return sendRedirect(event, `${settingsUrl}?error=` + encodeURIComponent(error))
  }

  if (!code) {
    return sendRedirect(event, `${settingsUrl}?error=missing_code`)
  }

  if (!product) {
    return sendRedirect(event, '/dashboard?error=no_product')
  }

  try {
    // Exchange code for tokens
    const tokens = await HelpScoutService.exchangeCodeForTokens(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return sendRedirect(event, `${settingsUrl}?error=missing_tokens`)
    }

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000)

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

    return sendRedirect(event, `${settingsUrl}?success=true`)
  } catch (err) {
    console.error('Help Scout callback error:', err)
    return sendRedirect(event, `${settingsUrl}?error=connection_failed`)
  }
})
