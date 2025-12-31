import { getOrCreateUser } from '../../utils/auth'
import { featureRequestRepository } from '../../repositories/feature-request.repository'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  const featureRequest = await featureRequestRepository.findByIdWithFeedback(id)

  if (!featureRequest) {
    notFound('Feature request not found')
  }

  // Verify user owns the product (product is included in the response from findByIdWithFeedback)
  const featureRequestWithProduct = await featureRequestRepository.findByIdWithProduct(id)
  if (!featureRequestWithProduct || featureRequestWithProduct.product.userId !== user.id) {
    notFound('Feature request not found')
  }

  return { data: featureRequest }
})
