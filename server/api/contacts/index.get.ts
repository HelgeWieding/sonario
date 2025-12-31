import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { contactRepository } from '../../repositories/contact.repository'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const query = getQuery(event)
  const productId = query.productId as string | undefined

  // Get user's products
  const userProducts = await productRepository.findAllByUserId(user.id)

  const productIds = productId
    ? [productId]
    : userProducts.map(p => p.id)

  if (productIds.length === 0) {
    return { data: [] }
  }

  // Get all contacts for the user's products with feedback count
  const contacts = await contactRepository.findAllByProductIds(productIds)

  return { data: contacts }
})
