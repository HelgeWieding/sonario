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

    // Check for existing connection and update or create
    const existingConnection = await db.query.helpscoutConnections.findFirst({
      where: eq(schema.helpscoutConnections.userId, user.id),
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
        userId: user.id,
        ...connectionData,
      })
    }

    return sendRedirect(event, '/settings/helpscout?success=true')
  } catch (error) {
    console.error('Help Scout callback error:', error)
    return sendRedirect(event, '/settings/helpscout?error=connection_failed')
  }
})
