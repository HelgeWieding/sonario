import { eq, and, desc, inArray } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = getDb()
  const contactId = getRouterParam(event, 'id')

  if (!contactId) {
    notFound('Contact not found')
  }

  // Get user's products to verify ownership
  const userProducts = await db.query.products.findMany({
    where: eq(schema.products.userId, user.id),
    columns: { id: true },
  })
  const productIds = userProducts.map(p => p.id)

  // Get the contact and verify it belongs to user's product
  const contact = await db.query.contacts.findFirst({
    where: and(
      eq(schema.contacts.id, contactId),
      inArray(schema.contacts.productId, productIds)
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
