import { getOrCreateUser, getContextProductIds, hasProductAccess } from '../../utils/auth'
import { contactRepository } from '../../repositories/contact.repository'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const query = getQuery(event)
  const productId = query.productId as string | undefined

  let productIds: string[]

  if (productId) {
    // Verify access to specific product in current context
    const hasAccess = await hasProductAccess(event, productId, user.id)
    if (!hasAccess) {
      return { data: [] }
    }
    productIds = [productId]
  } else {
    // Get products for current context (org or personal)
    productIds = await getContextProductIds(event, user.id)
  }

  if (productIds.length === 0) {
    return { data: [] }
  }

  // Get all contacts for the accessible products with feedback count
  const contacts = await contactRepository.findAllByProductIds(productIds)

  return { data: contacts }
})
