import { contactRepository } from '../repositories/contact.repository'
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
    return contactRepository.findOrCreate(productId, email, name)
  }
}
