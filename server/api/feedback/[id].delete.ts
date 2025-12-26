import { eq, sql } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound, handleDbError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feedback not found')
  }

  // Get feedback with feature request and product to verify ownership
  const feedbackItem = await db.query.feedback.findFirst({
    where: eq(schema.feedback.id, id),
    with: {
      featureRequest: {
        with: { product: true },
      },
    },
  })

  if (!feedbackItem || feedbackItem.featureRequest.product.userId !== user.id) {
    notFound('Feedback not found')
  }

  try {
    await db.delete(schema.feedback).where(eq(schema.feedback.id, id))

    // Decrement feedback count on feature request
    await db
      .update(schema.featureRequests)
      .set({
        feedbackCount: sql`GREATEST(${schema.featureRequests.feedbackCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(schema.featureRequests.id, feedbackItem.featureRequestId))

    return { data: { success: true } }
  } catch (error) {
    handleDbError(error)
  }
})
