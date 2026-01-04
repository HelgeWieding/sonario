import { getOrCreateUser, getAccessibleProductIds } from '../../utils/auth'
import { contactRepository } from '../../repositories/contact.repository'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const contactId = getRouterParam(event, 'id')

  if (!contactId) {
    notFound('Contact not found')
  }

  // Get all accessible products (owned + org-shared)
  const productIds = await getAccessibleProductIds(event, user.id)

  // Verify contact belongs to an accessible product
  const contactExists = await contactRepository.findByIdWithinProducts(contactId, productIds)
  if (!contactExists) {
    notFound('Contact not found')
  }

  // Get the contact with all feedback
  const contact = await contactRepository.findByIdWithFeedback(contactId)
  if (!contact) {
    notFound('Contact not found')
  }

  return { data: contact }
})
