import { pgTable, text, timestamp, uuid, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { products } from './products'

export const sentimentEnum = pgEnum('sentiment', ['positive', 'neutral', 'negative'])

export const categoryEnum = pgEnum('category', [
  'feature',
  'improvement',
  'bug',
  'integration',
  'ux',
  'performance',
  'documentation',
  'other',
])

export const statusEnum = pgEnum('status', [
  'untriaged',
  'reviewing',
  'planned',
  'in_progress',
  'completed',
  'rejected',
])

export const featureRequests = pgTable('feature_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  originalContent: text('original_content'), // Original email body from user
  category: categoryEnum('category').notNull().default('feature'),
  status: statusEnum('status').notNull().default('untriaged'),
  feedbackCount: integer('feedback_count').notNull().default(1),
  aiGenerated: boolean('ai_generated').notNull().default(false),
  sourceEmailId: text('source_email_id'), // Original Gmail message ID
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type FeatureRequest = typeof featureRequests.$inferSelect
export type NewFeatureRequest = typeof featureRequests.$inferInsert
