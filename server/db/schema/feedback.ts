import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'
import { products } from './products'
import { featureRequests, sentimentEnum } from './feature-requests'
import { contacts } from './contacts'
import { messageSourceEnum } from './processed-messages'

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  featureRequestId: uuid('feature_request_id').references(() => featureRequests.id, { onDelete: 'set null' }),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  sentiment: sentimentEnum('sentiment').notNull().default('neutral'),
  source: messageSourceEnum('source'), // null = manual/unknown
  senderEmail: text('sender_email'),
  senderName: text('sender_name'),
  emailMessageId: text('email_message_id'), // Gmail message ID
  aiExtracted: boolean('ai_extracted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Feedback = typeof feedback.$inferSelect
export type NewFeedback = typeof feedback.$inferInsert
