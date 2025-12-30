import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  emailFilter: text('email_filter'), // Optional email filter pattern
  autoDraftsEnabled: boolean('auto_drafts_enabled').notNull().default(false), // Auto-generate draft responses for existing feature requests
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
