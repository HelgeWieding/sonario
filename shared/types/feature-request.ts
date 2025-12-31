// Re-export the base FeatureRequest type from Drizzle schema (single source of truth)
export type { FeatureRequest, NewFeatureRequest } from '~~/server/db/schema/feature-requests'

// Import for extending
import type { FeatureRequest } from '~~/server/db/schema/feature-requests'
import type { Category, Status, Sentiment } from '../constants/enums'

// Enriched types (not directly from DB)
export interface FeatureRequestWithFeedback extends FeatureRequest {
  feedback: Array<{
    id: string
    content: string
    sentiment: Sentiment
    senderEmail: string | null
    senderName: string | null
    createdAt: Date
  }>
}

// API input types
export interface CreateFeatureRequestInput {
  productId: string
  title: string
  description: string
  category?: Category
}

export interface UpdateFeatureRequestInput {
  title?: string
  description?: string
  category?: Category
  status?: Status
}

// Types used for AI extraction
export interface ExtractedFeatureRequest {
  title: string
  description: string
  category: Category
  sentiment: Sentiment // For the initial feedback, not stored on feature request
}
