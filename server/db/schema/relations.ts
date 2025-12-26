import { relations } from 'drizzle-orm'
import { users } from './users'
import { products } from './products'
import { featureRequests } from './feature-requests'
import { contacts } from './contacts'
import { feedback } from './feedback'
import { gmailConnections } from './gmail-connections'
import { helpscoutConnections } from './helpscout-connections'

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  contacts: many(contacts),
  gmailConnections: many(gmailConnections),
  helpscoutConnections: many(helpscoutConnections),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  featureRequests: many(featureRequests),
}))

export const featureRequestsRelations = relations(featureRequests, ({ one, many }) => ({
  product: one(products, {
    fields: [featureRequests.productId],
    references: [products.id],
  }),
  feedback: many(feedback),
}))

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
  feedback: many(feedback),
}))

export const feedbackRelations = relations(feedback, ({ one }) => ({
  featureRequest: one(featureRequests, {
    fields: [feedback.featureRequestId],
    references: [featureRequests.id],
  }),
  contact: one(contacts, {
    fields: [feedback.contactId],
    references: [contacts.id],
  }),
}))

export const gmailConnectionsRelations = relations(gmailConnections, ({ one }) => ({
  user: one(users, {
    fields: [gmailConnections.userId],
    references: [users.id],
  }),
}))

export const helpscoutConnectionsRelations = relations(helpscoutConnections, ({ one }) => ({
  user: one(users, {
    fields: [helpscoutConnections.userId],
    references: [users.id],
  }),
}))
