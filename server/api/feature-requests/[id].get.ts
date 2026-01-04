import { getOrCreateUser, hasProductAccess } from '../../utils/auth'
import { featureRequestRepository } from '../../repositories/feature-request.repository'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  // Get the feature request with product info to verify access
  const featureRequestWithProduct = await featureRequestRepository.findByIdWithProduct(id)
  if (!featureRequestWithProduct) {
    notFound('Feature request not found')
  }

  // Verify user has access to the product (owner or org member)
  const hasAccess = await hasProductAccess(event, featureRequestWithProduct.product.id, user.id)
  if (!hasAccess) {
    notFound('Feature request not found')
  }

  const featureRequest = await featureRequestRepository.findByIdWithFeedback(id)

  return { data: featureRequest }
})
