import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import type { HelpScoutConnectionStatus } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  // Get user's product
  const product = await db.query.products.findFirst({
    where: eq(schema.products.userId, user.id),
  })

  const connection = product
    ? await db.query.helpscoutConnections.findFirst({
        where: eq(schema.helpscoutConnections.productId, product.id),
      })
    : null

  const status: HelpScoutConnectionStatus = {
    isConnected: !!connection,
    isActive: connection?.isActive || false,
    tokenExpiresAt: connection?.tokenExpiresAt || null,
    lastSyncAt: connection?.updatedAt || null,
  }

  return { data: status }
})
