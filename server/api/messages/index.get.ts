import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
import { processedMessageRepository } from '../../repositories/processed-message.repository'
import type { MessageSource } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)

  // Get user's products
  const products = await productRepository.findAllByUserId(user.id)

  if (products.length === 0) {
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  }

  const productIds = products.map(p => p.id)
  const query = getQuery(event)

  const source = query.source as MessageSource | undefined
  const isFeatureRequest = query.isFeatureRequest as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  const result = await processedMessageRepository.findAllByProductIds(productIds, {
    source,
    isFeatureRequest: isFeatureRequest !== undefined ? isFeatureRequest === 'true' : undefined,
    page,
    limit,
  })

  return result
})
