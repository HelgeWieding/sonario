import { getOrCreateUser } from '../../../utils/auth'
import { featureRequestRepository } from '../../../repositories/feature-request.repository'
import { notFound } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  // Verify ownership
  const featureRequest = await featureRequestRepository.findByIdWithProduct(id)
  if (!featureRequest || featureRequest.product.userId !== user.id) {
    notFound('Feature request not found')
  }

  const feedbackList = await featureRequestRepository.getFeedback(id)

  return { data: feedbackList }
})
