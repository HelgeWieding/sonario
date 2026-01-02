import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)

  // Get the user's single product with stats
  const product = await productRepository.findFirstWithStats(user.id)

  if (!product) {
    notFound('No product found')
  }

  return { data: product }
})
