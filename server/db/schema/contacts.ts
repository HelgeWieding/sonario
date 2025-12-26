import { pgTable, text, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('contacts_user_email_idx').on(table.userId, table.email),
])

export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert
