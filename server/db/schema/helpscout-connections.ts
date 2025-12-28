import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'
import { products } from './products'

export const helpscoutConnections = pgTable('helpscout_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
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
