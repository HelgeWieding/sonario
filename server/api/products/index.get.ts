import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)

  const products = await productRepository.findAllByUserId(user.id)

  return { data: products }
})
