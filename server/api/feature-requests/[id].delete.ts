import { getOrCreateUser } from '../../utils/auth'
import { featureRequestRepository } from '../../repositories/feature-request.repository'
import { notFound, handleDbError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  // Get the feature request to verify ownership
  const existing = await featureRequestRepository.findByIdWithProduct(id)
  if (!existing || existing.product.userId !== user.id) {
    notFound('Feature request not found')
  }

  try {
    await featureRequestRepository.delete(id)
    return { data: { success: true } }
  } catch (error) {
    handleDbError(error)
  }
})
