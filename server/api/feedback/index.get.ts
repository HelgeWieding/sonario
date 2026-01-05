import { getOrCreateUser, getContextProductIds } from '../../utils/auth'
import { feedbackRepository } from '../../repositories/feedback.repository'
import type { Sentiment } from '~~/shared/constants/enums'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)

  // Get products for current context (org or personal)
  const productIds = await getContextProductIds(event, user.id)

  if (productIds.length === 0) {
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  }

  const query = getQuery(event)

  const sentiment = query.sentiment as Sentiment | undefined
  const featureRequestId = query.featureRequestId as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  const result = await feedbackRepository.findAllByProductIds(productIds, {
    sentiment,
    featureRequestId,
    page,
    limit,
  })

  return result
})
