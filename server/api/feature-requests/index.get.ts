import { getOrCreateUser, hasProductAccess } from '../../utils/auth'
import { featureRequestRepository } from '../../repositories/feature-request.repository'
import { badRequest } from '../../utils/errors'
import type { Category, Status } from '~~/shared/constants/enums'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const query = getQuery(event)

  const productId = query.productId as string
  const status = query.status as Status | undefined
  const category = query.category as Category | undefined

  if (!productId) {
    badRequest('productId is required')
  }

  // Verify user has access to this product (owner or org member)
  const hasAccess = await hasProductAccess(event, productId, user.id)
  if (!hasAccess) {
    badRequest('Product not found')
  }

  const featureRequests = await featureRequestRepository.findAllByProductId(productId, {
    status,
    category,
  })

  return { data: featureRequests }
})
