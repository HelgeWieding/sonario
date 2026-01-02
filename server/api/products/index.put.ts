import { z } from 'zod'
import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { notFound, badRequest, handleDbError } from '../../utils/errors'
import { generateUniqueSlug } from '../../utils/slug'

const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  emailFilter: z.string().max(200).optional(),
  autoDraftsEnabled: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)

  const body = await readBody(event)
  const result = updateProductSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  try {
    const updateData = { ...result.data! }

    // If name is being updated, regenerate the slug
    if (updateData.name) {
      // First get the current product to exclude it from slug uniqueness check
      const currentProduct = await productRepository.findFirstWithStats(user.id)
      if (currentProduct) {
        updateData.slug = await generateUniqueSlug(updateData.name, user.id, currentProduct.id)
      }
    }

    const product = await productRepository.updateFirst(user.id, updateData)

    if (!product) {
      notFound('Product not found')
    }

    return { data: product }
  } catch (error) {
    handleDbError(error)
  }
})
