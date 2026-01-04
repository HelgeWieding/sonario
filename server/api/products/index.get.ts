import { getOrCreateUser, getAccessibleProductIds } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)

  // Get all accessible products (owned + org-shared)
  const productIds = await getAccessibleProductIds(event, user.id)

  if (productIds.length === 0) {
    notFound('No product found')
  }

  // Get the first accessible product with stats
  const products = await productRepository.findAllByIds(productIds)
  if (products.length === 0) {
    notFound('No product found')
  }

  const product = products[0]
  const stats = await productRepository.getProductStats(product.id)

  return {
    data: {
      ...product,
      ...stats,
    },
  }
})
