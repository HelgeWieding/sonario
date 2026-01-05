import { getOrCreateUser, getContextProductIds } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)

  // Get products for current context (org or personal)
  const productIds = await getContextProductIds(event, user.id)

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
