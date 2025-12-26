import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import type { HelpScoutConnectionStatus } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  const connection = await db.query.helpscoutConnections.findFirst({
    where: eq(schema.helpscoutConnections.userId, user.id),
  })

  const status: HelpScoutConnectionStatus = {
    isConnected: !!connection,
    isActive: connection?.isActive || false,
    tokenExpiresAt: connection?.tokenExpiresAt || null,
    lastSyncAt: connection?.updatedAt || null,
  }

  return { data: status }
})
