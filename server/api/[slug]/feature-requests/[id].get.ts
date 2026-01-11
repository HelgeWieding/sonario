import { getAuthContext } from '../../../utils/auth'
import { productRepository } from '../../../repositories/product.repository'
import { featureRequestRepository } from '../../../repositories/feature-request.repository'
import { notFound } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event)
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
  const hasAccess = await productRepository.hasProductAccess(
    auth.orgId ?? '',
    featureRequestWithProduct.product.id
  )
  if (!hasAccess) {
    notFound('Feature request not found')
  }

  const featureRequest = await featureRequestRepository.findByIdWithFeedback(id)

  return { data: featureRequest }
})
