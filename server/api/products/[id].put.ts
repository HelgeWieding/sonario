import { z } from 'zod'
import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { notFound, badRequest, handleDbError } from '../../utils/errors'

const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  emailFilter: z.string().max(200).optional(),
  autoDraftsEnabled: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Product not found')
  }

  const body = await readBody(event)
  const result = updateProductSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  try {
    const product = await productRepository.update(id, user.id, result.data!)

    if (!product) {
      notFound('Product not found')
    }

    return { data: product }
  } catch (error) {
    handleDbError(error)
  }
})
