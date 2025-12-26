import { eq } from 'drizzle-orm'
import { GmailService } from '../../services/gmail.service'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const config = useRuntimeConfig()

  const connection = await db.query.gmailConnections.findFirst({
    where: eq(schema.gmailConnections.userId, user.id),
  })

  if (!connection) {
    notFound('Gmail connection not found')
  }

  const gmailService = new GmailService(connection.accessToken, connection.refreshToken)

  // Setup new watch
  const watchResult = await gmailService.setupWatch(config.googlePubsubTopic)

  if (!watchResult) {
    throw createError({
      statusCode: 500,
      message: 'Failed to setup Gmail watch',
    })
  }

  // Update connection with new watch info
  await db
    .update(schema.gmailConnections)
    .set({
      watchExpiration: watchResult.expiration,
      historyId: watchResult.historyId,
      updatedAt: new Date(),
    })
    .where(eq(schema.gmailConnections.id, connection.id))

  return {
    data: {
      expiration: watchResult.expiration,
      historyId: watchResult.historyId,
    },
  }
})
