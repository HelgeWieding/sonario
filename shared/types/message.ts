// Normalized message types for cross-source compatibility

export interface NormalizedSender {
  email: string
  name: string | null
}

export interface NormalizedMessage {
  source: 'gmail' | 'helpscout' | 'hubspot' | 'zendesk' | 'zoho'
  sourceId: string
  sourceThreadId?: string
  sender: NormalizedSender
  subject: string
  content: string
  receivedAt: Date
}
