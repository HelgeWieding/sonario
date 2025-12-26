import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  // Delete the connection (cascades to processed_conversations)
  await db
    .delete(schema.helpscoutConnections)
    .where(eq(schema.helpscoutConnections.userId, user.id))

  return { success: true }
})
