import { pgTable, text, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core'
import { products } from './products'

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('contacts_product_email_idx').on(table.productId, table.email),
])

export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert
