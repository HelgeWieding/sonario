import { eq, count, and, gte } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import type { DashboardStats } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  // Get total products
  const [{ count: totalProducts }] = await db
    .select({ count: count() })
    .from(schema.products)
    .where(eq(schema.products.userId, user.id))

  // Get user's product IDs
  const products = await db.query.products.findMany({
    where: eq(schema.products.userId, user.id),
    columns: { id: true },
  })
  const productIds = products.map(p => p.id)

  let totalFeatureRequests = 0
  let newRequestsThisWeek = 0
  let totalFeedback = 0

  if (productIds.length > 0) {
    // Get total feature requests across all products
    for (const productId of productIds) {
      const [{ count: requestCount }] = await db
        .select({ count: count() })
        .from(schema.featureRequests)
        .where(eq(schema.featureRequests.productId, productId))
      totalFeatureRequests += requestCount

      // Get new requests this week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const [{ count: newCount }] = await db
        .select({ count: count() })
        .from(schema.featureRequests)
        .where(
          and(
            eq(schema.featureRequests.productId, productId),
            gte(schema.featureRequests.createdAt, oneWeekAgo)
          )
        )
      newRequestsThisWeek += newCount

      // Get total feedback
      const requests = await db.query.featureRequests.findMany({
        where: eq(schema.featureRequests.productId, productId),
        columns: { id: true },
      })

      for (const request of requests) {
        const [{ count: feedbackCount }] = await db
          .select({ count: count() })
          .from(schema.feedback)
          .where(eq(schema.feedback.featureRequestId, request.id))
        totalFeedback += feedbackCount
      }
    }
  }

  // Check Gmail connection (use first product)
  const gmailConnection = productIds.length > 0
    ? await db.query.gmailConnections.findFirst({
        where: eq(schema.gmailConnections.productId, productIds[0]),
      })
    : null

  const stats: DashboardStats = {
    totalProducts,
    totalFeatureRequests,
    newRequestsThisWeek,
    totalFeedback,
    gmailConnected: gmailConnection?.isActive || false,
  }

  return { data: stats }
})
