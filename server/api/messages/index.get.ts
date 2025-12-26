import { eq, and, desc, count } from 'drizzle-orm'
import { getDb, schema } from '../../db'

export default defineEventHandler(async (event) => {
  const db = getDb()
  const query = getQuery(event)

  const source = query.source as string | undefined
  const isFeatureRequest = query.isFeatureRequest as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const offset = (page - 1) * limit

  // Build conditions
  const conditions: ReturnType<typeof eq>[] = []

  if (source) {
    conditions.push(eq(schema.processedMessages.source, source as any))
  }
  if (isFeatureRequest !== undefined) {
    conditions.push(eq(schema.processedMessages.isFeatureRequest, isFeatureRequest === 'true'))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(schema.processedMessages)
    .where(whereClause)

  // Get paginated messages
  const messages = await db.query.processedMessages.findMany({
    where: whereClause,
    orderBy: [desc(schema.processedMessages.processedAt)],
    limit,
    offset,
  })

  return {
    data: messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
