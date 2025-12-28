import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  // Get user's product
  const product = await db.query.products.findFirst({
    where: eq(schema.products.userId, user.id),
  })

  if (product) {
    // Delete the connection
    await db
      .delete(schema.helpscoutConnections)
      .where(eq(schema.helpscoutConnections.productId, product.id))
  }

  return { success: true }
})
