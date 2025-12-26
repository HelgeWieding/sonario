import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

export const helpscoutConnections = pgTable('helpscout_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at'),
  webhookSecret: text('webhook_secret'), // For verifying incoming webhooks
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type HelpScoutConnection = typeof helpscoutConnections.$inferSelect
export type NewHelpScoutConnection = typeof helpscoutConnections.$inferInsert
