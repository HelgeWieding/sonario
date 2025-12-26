import { eq, and, count } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Product not found')
  }

  const product = await db.query.products.findFirst({
    where: and(
      eq(schema.products.id, id),
      eq(schema.products.userId, user.id)
    ),
  })

  if (!product) {
    notFound('Product not found')
  }

  // Get feature request count
  const [{ count: featureRequestCount }] = await db
    .select({ count: count() })
    .from(schema.featureRequests)
    .where(eq(schema.featureRequests.productId, product.id))

  // Get new request count
  const [{ count: newRequestCount }] = await db
    .select({ count: count() })
    .from(schema.featureRequests)
    .where(
      and(
        eq(schema.featureRequests.productId, product.id),
        eq(schema.featureRequests.status, 'new')
      )
    )

  return {
    data: {
      ...product,
      featureRequestCount,
      newRequestCount,
    },
  }
})
