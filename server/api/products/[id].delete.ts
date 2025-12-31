import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { notFound, handleDbError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Product not found')
  }

  try {
    const product = await productRepository.delete(id, user.id)

    if (!product) {
      notFound('Product not found')
    }

    return { data: { success: true } }
  } catch (error) {
    handleDbError(error)
  }
})
