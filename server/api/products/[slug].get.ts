import { getOrCreateUser } from '../../utils/auth'
import { hasProductAccess } from '../../utils/organization'
import { productRepository } from '../../repositories/product.repository'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    notFound('Product not found')
  }

  // Find product by slug (without user filter)
  const product = await productRepository.findBySlugOnly(slug)

  if (!product) {
    notFound('Product not found')
  }

  // Verify user has access to this product (owner or org member)
  const hasAccess = await hasProductAccess(event, product.id, user.id)
  if (!hasAccess) {
    notFound('Product not found')
  }

  // Get stats for the product
  const stats = await productRepository.getProductStats(product.id)

  return {
    data: {
      ...product,
      ...stats,
    },
  }
})
