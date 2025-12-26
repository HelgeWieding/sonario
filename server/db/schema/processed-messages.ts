import { pgTable, text, timestamp, uuid, boolean, pgEnum } from 'drizzle-orm/pg-core'

export const messageSourceEnum = pgEnum('message_source', [
  'gmail',
  'helpscout',
  'hubspot',
  'zendesk',
  'zoho',
])

export const processedMessages = pgTable('processed_messages', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Source identification
  source: messageSourceEnum('source').notNull(),
  sourceMessageId: text('source_message_id').notNull(), // Gmail message ID, HelpScout conversation ID, etc.
  sourceThreadId: text('source_thread_id'), // For sources that have thread grouping

  // Message metadata
  subject: text('subject'),
  senderEmail: text('sender_email'),
  senderName: text('sender_name'),
  content: text('content'), // Store original content for later feedback creation

  // Processing results
  isFeatureRequest: boolean('is_feature_request').notNull().default(false),
  featureRequestId: uuid('feature_request_id'), // Link to created feature request if any
  feedbackId: uuid('feedback_id'), // Link to created feedback if any

  processedAt: timestamp('processed_at').notNull().defaultNow(),
})

export type ProcessedMessage = typeof processedMessages.$inferSelect
export type NewProcessedMessage = typeof processedMessages.$inferInsert
export type MessageSource = typeof messageSourceEnum.enumValues[number]
