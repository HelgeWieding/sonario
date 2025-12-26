import { eq, and, desc } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { badRequest } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const query = getQuery(event)

  const productId = query.productId as string
  const status = query.status as string | undefined
  const category = query.category as string | undefined

  if (!productId) {
    badRequest('productId is required')
  }

  // Verify user owns this product
  const product = await db.query.products.findFirst({
    where: and(
      eq(schema.products.id, productId),
      eq(schema.products.userId, user.id)
    ),
  })

  if (!product) {
    badRequest('Product not found')
  }

  // Build conditions
  const conditions = [eq(schema.featureRequests.productId, productId)]

  if (status) {
    conditions.push(eq(schema.featureRequests.status, status as any))
  }
  if (category) {
    conditions.push(eq(schema.featureRequests.category, category as any))
  }

  const featureRequests = await db.query.featureRequests.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.featureRequests.createdAt)],
  })

  return { data: featureRequests }
})
