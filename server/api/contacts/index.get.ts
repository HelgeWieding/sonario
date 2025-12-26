import { eq, desc, sql } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  // Get all contacts for the user with feedback count
  const contacts = await db
    .select({
      id: schema.contacts.id,
      email: schema.contacts.email,
      name: schema.contacts.name,
      createdAt: schema.contacts.createdAt,
      updatedAt: schema.contacts.updatedAt,
      feedbackCount: sql<number>`count(${schema.feedback.id})::int`,
      lastFeedbackAt: sql<string>`max(${schema.feedback.createdAt})`,
    })
    .from(schema.contacts)
    .leftJoin(schema.feedback, eq(schema.feedback.contactId, schema.contacts.id))
    .where(eq(schema.contacts.userId, user.id))
    .groupBy(schema.contacts.id)
    .orderBy(desc(sql`max(${schema.feedback.createdAt})`))

  return { data: contacts }
})
