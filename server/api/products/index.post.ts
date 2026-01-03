import { z } from 'zod'
import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { generateUniqueSlug } from '../../utils/slug'
import { badRequest } from '../../utils/errors'

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const body = await readBody(event)

  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) {
    badRequest('Invalid product data')
  }

  const { name, description } = parsed.data!

  // Check if user already has a product (single product per user for now)
  const existingProducts = await productRepository.findAllByUserId(user.id)
  if (existingProducts.length > 0) {
    badRequest('You already have a product')
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(name, user.id)

  // Create the product
  const product = await productRepository.create({
    userId: user.id,
    name,
    slug,
    description: description || null,
  })

  return { data: product }
})
