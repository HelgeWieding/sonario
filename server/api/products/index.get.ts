import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  const products = await db.query.products.findMany({
    where: eq(schema.products.userId, user.id),
    orderBy: (products, { asc }) => [asc(products.createdAt)],
  })

  return { data: products }
})
