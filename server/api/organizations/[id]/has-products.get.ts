import { requireAuth } from '../../../utils/auth'
import { productRepository } from '../../../repositories/product.repository'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const orgId = getRouterParam(event, 'id')

  if (!orgId) {
    throw createError({
      statusCode: 400,
      message: 'Organization ID is required',
    })
  }

  const hasProducts = await productRepository.organizationHasProducts(orgId)

  return { hasProducts }
})
