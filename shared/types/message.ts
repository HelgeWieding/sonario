// Re-export the base ProcessedMessage type from Drizzle schema (single source of truth)
export type {
  ProcessedMessage,
  NewProcessedMessage,
  MessageSource,
} from '~~/server/db/schema/processed-messages'

// Normalized message types for cross-source compatibility (used by transformers)
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
