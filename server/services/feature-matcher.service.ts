import { eq } from 'drizzle-orm'
import { ClaudeService } from './claude.service'
import { getDb, schema } from '../db'
import type { ExtractedFeatureRequest, FeatureRequest } from '~~/shared/types'

export class FeatureMatcherService {
  /**
   * Find a matching feature request for the given extracted request
   */
  static async findMatch(
    newRequest: ExtractedFeatureRequest,
    productId: string,
    claudeService: ClaudeService
  ): Promise<FeatureRequest | null> {
    const db = getDb()

    // Get existing feature requests for this product
    const existingRequests = await db.query.featureRequests.findMany({
      where: eq(schema.featureRequests.productId, productId),
      orderBy: (requests, { desc }) => [desc(requests.feedbackCount)],
      limit: 50, // Limit to most popular requests for efficiency
    })

    if (existingRequests.length === 0) {
      return null
    }

    // Use Claude to find a match
    return claudeService.findMatchingRequest(newRequest, existingRequests as FeatureRequest[])
  }
}
