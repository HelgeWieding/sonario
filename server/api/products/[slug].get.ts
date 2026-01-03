import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    notFound('Product not found')
  }

  const product = await productRepository.findBySlugWithStats(slug, user.id)

  if (!product) {
    notFound('Product not found')
  }

  return { data: product }
})
