import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { badRequest, handleDbError } from '../../utils/errors'
import { CATEGORIES } from '~~/shared/constants'

const createFeatureRequestSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.enum(CATEGORIES).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  const body = await readBody(event)
  const result = createFeatureRequestSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  // Verify user owns this product
  const product = await db.query.products.findFirst({
    where: and(
      eq(schema.products.id, result.data!.productId),
      eq(schema.products.userId, user.id)
    ),
  })

  if (!product) {
    badRequest('Product not found')
  }

  try {
    const [featureRequest] = await db.insert(schema.featureRequests).values({
      productId: result.data!.productId,
      title: result.data!.title,
      description: result.data!.description,
      category: result.data!.category || 'feature',
      aiGenerated: false,
    }).returning()

    return { data: featureRequest }
  } catch (error) {
    handleDbError(error)
  }
})
