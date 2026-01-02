import { pgTable, text, timestamp, uuid, boolean, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  emailFilter: text('email_filter'),
  autoDraftsEnabled: boolean('auto_drafts_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('products_user_slug_idx').on(table.userId, table.slug),
])

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
