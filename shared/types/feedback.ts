// Re-export the base Feedback type from Drizzle schema (single source of truth)
export type { Feedback, NewFeedback } from '~~/server/db/schema/feedback'

// Import for extending
import type { Feedback } from '~~/server/db/schema/feedback'
import type { Sentiment } from '../constants/enums'

// Enriched types (not directly from DB)
export interface FeedbackWithRelations extends Feedback {
  featureRequest: {
    id: string
    title: string
  } | null
  contact: {
    id: string
    email: string
    name: string | null
  } | null
}

// API input types
export interface CreateFeedbackInput {
  productId: string
  featureRequestId?: string
  content: string
  sentiment?: Sentiment
  senderEmail?: string
  senderName?: string
}
