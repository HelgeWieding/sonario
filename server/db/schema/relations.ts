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
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  featureRequests: many(featureRequests),
  feedback: many(feedback),
  contacts: many(contacts),
  gmailConnections: many(gmailConnections),
  helpscoutConnections: many(helpscoutConnections),
}))

export const featureRequestsRelations = relations(featureRequests, ({ one, many }) => ({
  product: one(products, {
    fields: [featureRequests.productId],
    references: [products.id],
  }),
  feedback: many(feedback),
}))

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  product: one(products, {
    fields: [contacts.productId],
    references: [products.id],
  }),
  feedback: many(feedback),
}))

export const feedbackRelations = relations(feedback, ({ one }) => ({
  product: one(products, {
    fields: [feedback.productId],
    references: [products.id],
  }),
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
  product: one(products, {
    fields: [gmailConnections.productId],
    references: [products.id],
  }),
}))

export const helpscoutConnectionsRelations = relations(helpscoutConnections, ({ one }) => ({
  product: one(products, {
    fields: [helpscoutConnections.productId],
    references: [products.id],
  }),
}))
