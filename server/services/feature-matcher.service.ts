import { ClaudeService } from './claude.service'
import { featureRequestRepository } from '../repositories/feature-request.repository'
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
    // Get existing feature requests for this product, ordered by feedback count
    const existingRequests = await featureRequestRepository.findAllByProductId(productId, {
      limit: 50,
      orderByFeedbackCount: true,
    })

    if (existingRequests.length === 0) {
      return null
    }

    // Use Claude to find a match
    return claudeService.findMatchingRequest(newRequest, existingRequests)
  }
}
