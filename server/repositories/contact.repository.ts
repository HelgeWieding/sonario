import { eq, and, desc, sql, inArray } from 'drizzle-orm'
import { getDb, schema } from '../db'
import type { Contact } from '~~/server/db/schema/contacts'

export interface ContactWithStats extends Contact {
  feedbackCount: number
  lastFeedbackAt: string | null
}

export interface ContactWithFeedback extends Contact {
  feedback: Array<{
    id: string
    content: string
    sentiment: string
    createdAt: Date
    featureRequest: {
      id: string
      title: string
      productId: string
    } | null
  }>
}

class ContactRepository {
  private get db() {
    return getDb()
  }

  /**
   * Find or create a contact by email for a product.
   * If the contact exists but has no name, and a name is provided, update the name.
   */
  async findOrCreate(
    productId: string,
    email: string,
    name?: string | null
  ): Promise<Contact> {
    // Try to find existing contact
    let contact = await this.db.query.contacts.findFirst({
      where: and(
        eq(schema.contacts.productId, productId),
        eq(schema.contacts.email, email)
      ),
    })

    if (!contact) {
      // Create new contact
      const [newContact] = await this.db.insert(schema.contacts).values({
        productId,
        email,
        name: name || undefined,
      }).returning()
      return newContact!
    }

    if (name && !contact.name) {
      // Update name if we have one and contact doesn't
      const [updatedContact] = await this.db.update(schema.contacts)
        .set({ name, updatedAt: new Date() })
        .where(eq(schema.contacts.id, contact.id))
        .returning()
      return updatedContact!
    }

    return contact
  }

  /**
   * Find a contact by ID
   */
  async findById(id: string): Promise<Contact | null> {
    return await this.db.query.contacts.findFirst({
      where: eq(schema.contacts.id, id),
    }) ?? null
  }

  /**
   * Find a contact by ID with ownership verification (must belong to one of the product IDs)
   */
  async findByIdWithinProducts(id: string, productIds: string[]): Promise<Contact | null> {
    return await this.db.query.contacts.findFirst({
      where: and(
        eq(schema.contacts.id, id),
        inArray(schema.contacts.productId, productIds)
      ),
    }) ?? null
  }

  /**
   * Find a contact by ID with all their feedback
   */
  async findByIdWithFeedback(id: string): Promise<ContactWithFeedback | null> {
    const contact = await this.db.query.contacts.findFirst({
      where: eq(schema.contacts.id, id),
    })

    if (!contact) {
      return null
    }

    const feedbackItems = await this.db.query.feedback.findMany({
      where: eq(schema.feedback.contactId, id),
      with: {
        featureRequest: {
          columns: {
            id: true,
            title: true,
            productId: true,
          },
        },
      },
      orderBy: [desc(schema.feedback.createdAt)],
    })

    return {
      ...contact,
      feedback: feedbackItems.map(f => ({
        id: f.id,
        content: f.content,
        sentiment: f.sentiment,
        createdAt: f.createdAt,
        featureRequest: f.featureRequest,
      })),
    }
  }

  /**
   * Find all contacts for products with feedback stats
   */
  async findAllByProductIds(productIds: string[]): Promise<ContactWithStats[]> {
    const contacts = await this.db
      .select({
        id: schema.contacts.id,
        productId: schema.contacts.productId,
        email: schema.contacts.email,
        name: schema.contacts.name,
        createdAt: schema.contacts.createdAt,
        updatedAt: schema.contacts.updatedAt,
        feedbackCount: sql<number>`count(${schema.feedback.id})::int`,
        lastFeedbackAt: sql<string>`max(${schema.feedback.createdAt})`,
      })
      .from(schema.contacts)
      .leftJoin(schema.feedback, eq(schema.feedback.contactId, schema.contacts.id))
      .where(inArray(schema.contacts.productId, productIds))
      .groupBy(schema.contacts.id)
      .orderBy(desc(sql`max(${schema.feedback.createdAt})`))

    return contacts
  }
}

// Singleton export
export const contactRepository = new ContactRepository()
