// Re-export the base Contact type from Drizzle schema (single source of truth)
export type { Contact, NewContact } from '~~/server/db/schema/contacts'

// Import for extending
import type { Contact } from '~~/server/db/schema/contacts'

// Enriched types (not directly from DB)
export interface ContactWithStats extends Contact {
  feedbackCount: number
  lastFeedbackAt: string | null
}

export interface ContactWithFeedback extends Contact {
  feedback: Array<{
    id: string
    content: string
    sentiment: string
    createdAt: Date
    featureRequest: {
      id: string
      title: string
      productId: string
    } | null
  }>
}
