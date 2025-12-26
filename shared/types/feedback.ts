import type { Sentiment } from '../constants/enums'

export interface Feedback {
  id: string
  featureRequestId: string
  content: string
  sentiment: Sentiment
  senderEmail: string | null
  senderName: string | null
  emailMessageId: string | null
  aiExtracted: boolean
  createdAt: Date
}

export interface CreateFeedbackInput {
  featureRequestId: string
  content: string
  sentiment?: Sentiment
  senderEmail?: string
  senderName?: string
}
