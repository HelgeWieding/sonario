import { eq, and } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  // Get the feature request with its product
  const featureRequest = await db.query.featureRequests.findFirst({
    where: eq(schema.featureRequests.id, id),
    with: {
      product: true,
    },
  })

  if (!featureRequest) {
    notFound('Feature request not found')
  }

  // Verify user owns the product
  if (featureRequest.product.userId !== user.id) {
    notFound('Feature request not found')
  }

  // Get feedback for this request
  const feedbackList = await db.query.feedback.findMany({
    where: eq(schema.feedback.featureRequestId, id),
    orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
  })

  return {
    data: {
      ...featureRequest,
      feedback: feedbackList,
    },
  }
})
