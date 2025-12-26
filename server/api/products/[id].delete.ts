import { eq, and } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound, handleDbError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Product not found')
  }

  try {
    const [product] = await db
      .delete(schema.products)
      .where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.userId, user.id)
        )
      )
      .returning()

    if (!product) {
      notFound('Product not found')
    }

    return { data: { success: true } }
  } catch (error) {
    handleDbError(error)
  }
})
