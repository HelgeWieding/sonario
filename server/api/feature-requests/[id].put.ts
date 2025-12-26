import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound, badRequest, handleDbError } from '../../utils/errors'
import { CATEGORIES, STATUSES } from '~~/shared/constants'

const updateFeatureRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  category: z.enum(CATEGORIES).optional(),
  status: z.enum(STATUSES).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  const body = await readBody(event)
  const result = updateFeatureRequestSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  // Get the feature request to verify ownership
  const existing = await db.query.featureRequests.findFirst({
    where: eq(schema.featureRequests.id, id),
    with: { product: true },
  })

  if (!existing || existing.product.userId !== user.id) {
    notFound('Feature request not found')
  }

  try {
    const [featureRequest] = await db
      .update(schema.featureRequests)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(schema.featureRequests.id, id))
      .returning()

    return { data: featureRequest }
  } catch (error) {
    handleDbError(error)
  }
})
