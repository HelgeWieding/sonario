import { z } from 'zod'
import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { featureRequestRepository } from '../../repositories/feature-request.repository'
import { feedbackRepository } from '../../repositories/feedback.repository'
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

  const body = await readBody(event)
  const result = createFeedbackSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  // Verify user owns the product
  const ownsProduct = await productRepository.verifyOwnership(result.data!.productId, user.id)
  if (!ownsProduct) {
    notFound('Product not found')
  }

  // If featureRequestId is provided, verify it belongs to the same product
  if (result.data!.featureRequestId) {
    const featureRequest = await featureRequestRepository.findById(result.data!.featureRequestId)
    if (!featureRequest || featureRequest.productId !== result.data!.productId) {
      notFound('Feature request not found')
    }
  }

  try {
    const feedback = await feedbackRepository.create({
      productId: result.data!.productId,
      featureRequestId: result.data!.featureRequestId || null,
      content: result.data!.content,
      sentiment: result.data!.sentiment,
      senderEmail: result.data!.senderEmail || null,
      senderName: result.data!.senderName || null,
      aiExtracted: false,
    })

    // Increment feedback count on feature request if linked
    if (result.data!.featureRequestId) {
      await featureRequestRepository.incrementFeedbackCount(result.data!.featureRequestId)
    }

    return { data: feedback }
  } catch (error) {
    handleDbError(error)
  }
})
