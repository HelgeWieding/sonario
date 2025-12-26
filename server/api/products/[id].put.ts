import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound, badRequest, handleDbError } from '../../utils/errors'

const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  emailFilter: z.string().max(200).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
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
    const [product] = await db
      .update(schema.products)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.userId, user.id)
        )
      )
      .returning()

    if (!product) {
      notFound('Product not found')
    }

    return { data: product }
  } catch (error) {
    handleDbError(error)
  }
})
