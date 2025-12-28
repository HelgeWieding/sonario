import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import type { GmailConnectionStatus } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  // Get user's product
  const product = await db.query.products.findFirst({
    where: eq(schema.products.userId, user.id),
  })

  const connection = product
    ? await db.query.gmailConnections.findFirst({
        where: eq(schema.gmailConnections.productId, product.id),
      })
    : null

  const status: GmailConnectionStatus = {
    isConnected: !!connection,
    email: connection?.email || null,
    isActive: connection?.isActive || false,
    watchExpiration: connection?.watchExpiration || null,
    lastSyncAt: connection?.updatedAt || null,
  }

  return { data: status }
})
