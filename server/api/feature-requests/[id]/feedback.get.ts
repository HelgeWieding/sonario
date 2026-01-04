import { getOrCreateUser, hasProductAccess } from '../../../utils/auth'
import { featureRequestRepository } from '../../../repositories/feature-request.repository'
import { notFound } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  // Get the feature request to verify access
  const featureRequest = await featureRequestRepository.findByIdWithProduct(id)
  if (!featureRequest) {
    notFound('Feature request not found')
  }

  // Verify user has access to the product (owner or org member)
  const hasAccess = await hasProductAccess(event, featureRequest.product.id, user.id)
  if (!hasAccess) {
    notFound('Feature request not found')
  }

  const feedbackList = await featureRequestRepository.getFeedback(id)

  return { data: feedbackList }
})
