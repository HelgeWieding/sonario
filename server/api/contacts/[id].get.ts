import { getOrCreateUser } from '../../utils/auth'
import { productRepository } from '../../repositories/product.repository'
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

  // Get user's products to verify ownership
  const userProducts = await productRepository.findAllByUserId(user.id)
  const productIds = userProducts.map(p => p.id)

  // Verify contact belongs to user's product
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
