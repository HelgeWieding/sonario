import { getAuthContext } from '../../../../utils/auth'
import { productRepository } from '../../../../repositories/product.repository'
import { featureRequestRepository } from '../../../../repositories/feature-request.repository'
import { notFound } from '../../../../utils/errors'

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event)
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
  const hasAccess = await productRepository.hasProductAccess(
    auth.orgId ?? '',
    featureRequest.product.id
  )
  if (!hasAccess) {
    notFound('Feature request not found')
  }

  const feedbackList = await featureRequestRepository.getFeedback(id)

  return { data: feedbackList }
})
