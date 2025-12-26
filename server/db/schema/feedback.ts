import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'
import { featureRequests, sentimentEnum } from './feature-requests'
import { contacts } from './contacts'

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  featureRequestId: uuid('feature_request_id').notNull().references(() => featureRequests.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  sentiment: sentimentEnum('sentiment').notNull().default('neutral'),
  senderEmail: text('sender_email'),
  senderName: text('sender_name'),
  emailMessageId: text('email_message_id'), // Gmail message ID
  aiExtracted: boolean('ai_extracted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Feedback = typeof feedback.$inferSelect
export type NewFeedback = typeof feedback.$inferInsert
