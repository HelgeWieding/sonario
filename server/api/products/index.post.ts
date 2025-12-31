import { z } from 'zod'
import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { badRequest, handleDbError } from '../../utils/errors'

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  emailFilter: z.string().max(200).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)

  const body = await readBody(event)
  const result = createProductSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  try {
    const product = await productRepository.create({
      userId: user.id,
      name: result.data!.name,
      description: result.data!.description,
      emailFilter: result.data!.emailFilter,
    })

    return { data: product }
  } catch (error) {
    handleDbError(error)
  }
})
