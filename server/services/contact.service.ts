import { eq, and } from 'drizzle-orm'
import { getDb, schema } from '../db'
import type { Contact } from '../db/schema/contacts'

export class ContactService {
  /**
   * Find or create a contact by email for a product.
   * If the contact exists but has no name, and a name is provided, update the name.
   */
  static async findOrCreate(
    productId: string,
    email: string,
    name?: string | null
  ): Promise<Contact> {
    const db = getDb()

    // Try to find existing contact
    let contact = await db.query.contacts.findFirst({
      where: and(
        eq(schema.contacts.productId, productId),
        eq(schema.contacts.email, email)
      ),
    })

    if (!contact) {
      // Create new contact
      const [newContact] = await db.insert(schema.contacts).values({
        productId,
        email,
        name: name || undefined,
      }).returning()
      return newContact!
    }

    if (name && !contact.name) {
      // Update name if we have one and contact doesn't
      const [updatedContact] = await db.update(schema.contacts)
        .set({ name, updatedAt: new Date() })
        .where(eq(schema.contacts.id, contact.id))
        .returning()
      return updatedContact!
    }

    return contact
  }
}
