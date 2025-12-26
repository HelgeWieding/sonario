import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import type { GmailConnectionStatus } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  const connection = await db.query.gmailConnections.findFirst({
    where: eq(schema.gmailConnections.userId, user.id),
  })

  const status: GmailConnectionStatus = {
    isConnected: !!connection,
    email: connection?.email || null,
    isActive: connection?.isActive || false,
    watchExpiration: connection?.watchExpiration || null,
    lastSyncAt: connection?.updatedAt || null,
  }

  return { data: status }
})
