import { eq, and, desc, count, inArray } from 'drizzle-orm'
import { getDb, schema } from '../../db'

export default defineEventHandler(async (event) => {
  // Authenticate user
  const { userId: clerkUserId } = event.context.auth()
  if (!clerkUserId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const db = getDb()

  // Get internal user ID
  const user = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkUserId),
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found',
    })
  }

  // Get user's products
  const products = await db.query.products.findMany({
    where: eq(schema.products.userId, user.id),
  })

  if (products.length === 0) {
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  }

  const productIds = products.map(p => p.id)
  const query = getQuery(event)

  const sentiment = query.sentiment as string | undefined
  const featureRequestId = query.featureRequestId as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const offset = (page - 1) * limit

  // Build conditions - filter by user's products
  const conditions: ReturnType<typeof eq>[] = [
    inArray(schema.feedback.productId, productIds),
  ]

  if (sentiment) {
    conditions.push(eq(schema.feedback.sentiment, sentiment as any))
  }
  if (featureRequestId) {
    conditions.push(eq(schema.feedback.featureRequestId, featureRequestId))
  }

  const whereClause = and(...conditions)

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(schema.feedback)
    .where(whereClause)

  // Get paginated feedback with related feature request
  const feedbackList = await db.query.feedback.findMany({
    where: whereClause,
    orderBy: [desc(schema.feedback.createdAt)],
    limit,
    offset,
    with: {
      featureRequest: {
        columns: {
          id: true,
          title: true,
        },
      },
      contact: {
        columns: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  return {
    data: feedbackList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
