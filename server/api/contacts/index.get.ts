import { eq, desc, sql, inArray } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = getDb()
  const query = getQuery(event)
  const productId = query.productId as string | undefined

  // Get user's products
  const userProducts = await db.query.products.findMany({
    where: eq(schema.products.userId, user.id),
    columns: { id: true },
  })

  const productIds = productId
    ? [productId]
    : userProducts.map(p => p.id)

  if (productIds.length === 0) {
    return { data: [] }
  }

  // Get all contacts for the user's products with feedback count
  const contacts = await db
    .select({
      id: schema.contacts.id,
      productId: schema.contacts.productId,
      email: schema.contacts.email,
      name: schema.contacts.name,
      createdAt: schema.contacts.createdAt,
      updatedAt: schema.contacts.updatedAt,
      feedbackCount: sql<number>`count(${schema.feedback.id})::int`,
      lastFeedbackAt: sql<string>`max(${schema.feedback.createdAt})`,
    })
    .from(schema.contacts)
    .leftJoin(schema.feedback, eq(schema.feedback.contactId, schema.contacts.id))
    .where(inArray(schema.contacts.productId, productIds))
    .groupBy(schema.contacts.id)
    .orderBy(desc(sql`max(${schema.feedback.createdAt})`))

  return { data: contacts }
})
