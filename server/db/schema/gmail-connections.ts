import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

export const gmailConnections = pgTable('gmail_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),
  watchExpiration: timestamp('watch_expiration'), // Gmail watch expiration
  historyId: text('history_id'), // Last processed history ID
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type GmailConnection = typeof gmailConnections.$inferSelect
export type NewGmailConnection = typeof gmailConnections.$inferInsert
