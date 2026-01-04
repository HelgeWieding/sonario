import { getOrCreateUser, hasProductAccess } from '../../utils/auth'
import { feedbackRepository } from '../../repositories/feedback.repository'
import { featureRequestRepository } from '../../repositories/feature-request.repository'
import { notFound, handleDbError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feedback not found')
  }

  // Get feedback with feature request and product to verify access
  const feedbackItem = await feedbackRepository.findByIdWithRelations(id)

  if (!feedbackItem || !feedbackItem.featureRequest) {
    notFound('Feedback not found')
  }

  // Verify user has access to the product (owner or org member)
  const hasAccess = await hasProductAccess(event, feedbackItem.featureRequest.product.id, user.id)
  if (!hasAccess) {
    notFound('Feedback not found')
  }

  try {
    await feedbackRepository.delete(id)

    // Decrement feedback count on feature request
    if (feedbackItem.featureRequestId) {
      await featureRequestRepository.decrementFeedbackCount(feedbackItem.featureRequestId)
    }

    return { data: { success: true } }
  } catch (error) {
    handleDbError(error)
  }
})
