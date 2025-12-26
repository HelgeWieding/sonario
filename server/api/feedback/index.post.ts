import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { badRequest, notFound, handleDbError } from '../../utils/errors'
import { SENTIMENTS } from '~~/shared/constants'

const createFeedbackSchema = z.object({
  featureRequestId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  sentiment: z.enum(SENTIMENTS).optional(),
  senderEmail: z.string().email().optional(),
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

  // Verify user owns the feature request's product
  const featureRequest = await db.query.featureRequests.findFirst({
    where: eq(schema.featureRequests.id, result.data!.featureRequestId),
    with: { product: true },
  })

  if (!featureRequest || featureRequest.product.userId !== user.id) {
    notFound('Feature request not found')
  }

  try {
    const [feedback] = await db.insert(schema.feedback).values({
      featureRequestId: result.data!.featureRequestId,
      content: result.data!.content,
      sentiment: result.data!.sentiment || 'neutral',
      senderEmail: result.data!.senderEmail || null,
      senderName: result.data!.senderName || null,
      aiExtracted: false,
    }).returning()

    // Increment feedback count on feature request
    await db
      .update(schema.featureRequests)
      .set({
        feedbackCount: sql`${schema.featureRequests.feedbackCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.featureRequests.id, result.data!.featureRequestId))

    return { data: feedback }
  } catch (error) {
    handleDbError(error)
  }
})
