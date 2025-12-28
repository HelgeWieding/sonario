import type { Sentiment } from '../constants/enums'

export interface Feedback {
  id: string
  productId: string
  featureRequestId: string | null
  content: string
  sentiment: Sentiment
  senderEmail: string | null
  senderName: string | null
  emailMessageId: string | null
  aiExtracted: boolean
  createdAt: Date
}

export interface CreateFeedbackInput {
  productId: string
  featureRequestId?: string
  content: string
  sentiment?: Sentiment
  senderEmail?: string
  senderName?: string
}
