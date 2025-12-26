import type { Category, Status } from '../constants/enums'
import type { Sentiment } from '../constants/enums'

export interface FeatureRequest {
  id: string
  productId: string
  title: string
  description: string
  category: Category
  status: Status
  feedbackCount: number
  aiGenerated: boolean
  sourceEmailId: string | null
  createdAt: Date
  updatedAt: Date
}

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

export interface ExtractedFeatureRequest {
  title: string
  description: string
  category: Category
  sentiment: Sentiment // For the initial feedback, not stored on feature request
}
