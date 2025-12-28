import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { badRequest, notFound, handleDbError } from '../../utils/errors'
import { SENTIMENTS } from '~~/shared/constants'

const createFeedbackSchema = z.object({
  productId: z.string().uuid(),
  featureRequestId: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
  sentiment: z.enum(SENTIMENTS).optional(),
  senderEmail: z.string().email().optional().or(z.literal('')),
  senderName: z.string().max(100).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  const body = await readBody(event)
  const result = createFeedbackSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  // Verify user owns the product
  const product = await db.query.products.findFirst({
    where: eq(schema.products.id, result.data!.productId),
  })

  if (!product || product.userId !== user.id) {
    notFound('Product not found')
  }

  // If featureRequestId is provided, verify it belongs to the same product
  if (result.data!.featureRequestId) {
    const featureRequest = await db.query.featureRequests.findFirst({
      where: eq(schema.featureRequests.id, result.data!.featureRequestId),
    })

    if (!featureRequest || featureRequest.productId !== result.data!.productId) {
      notFound('Feature request not found')
    }
  }

  try {
    const [feedback] = await db.insert(schema.feedback).values({
      productId: result.data!.productId,
      featureRequestId: result.data!.featureRequestId || null,
      content: result.data!.content,
      sentiment: result.data!.sentiment || 'neutral',
      senderEmail: result.data!.senderEmail || null,
      senderName: result.data!.senderName || null,
      aiExtracted: false,
    }).returning()

    // Increment feedback count on feature request if linked
    if (result.data!.featureRequestId) {
      await db
        .update(schema.featureRequests)
        .set({
          feedbackCount: sql`${schema.featureRequests.feedbackCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.featureRequests.id, result.data!.featureRequestId))
    }

    return { data: feedback }
  } catch (error) {
    handleDbError(error)
  }
})
