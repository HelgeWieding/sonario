import { eq, and, desc } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const contactId = getRouterParam(event, 'id')

  if (!contactId) {
    notFound('Contact not found')
  }

  // Get the contact and verify ownership
  const contact = await db.query.contacts.findFirst({
    where: and(
      eq(schema.contacts.id, contactId),
      eq(schema.contacts.userId, user.id)
    ),
  })

  if (!contact) {
    notFound('Contact not found')
  }

  // Get all feedback from this contact with feature request info
  const feedbackItems = await db.query.feedback.findMany({
    where: eq(schema.feedback.contactId, contactId),
    with: {
      featureRequest: {
        columns: {
          id: true,
          title: true,
          productId: true,
        },
      },
    },
    orderBy: [desc(schema.feedback.createdAt)],
  })

  return {
    data: {
      ...contact,
      feedback: feedbackItems,
    },
  }
})
