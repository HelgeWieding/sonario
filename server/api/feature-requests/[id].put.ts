import { z } from 'zod'
import { getOrCreateUser } from '../../utils/auth'
import { featureRequestRepository } from '../../repositories/feature-request.repository'
import { notFound, badRequest, handleDbError } from '../../utils/errors'
import { CATEGORIES, STATUSES } from '~~/shared/constants'

const updateFeatureRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  category: z.enum(CATEGORIES).optional(),
  status: z.enum(STATUSES).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  const body = await readBody(event)
  const result = updateFeatureRequestSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  // Get the feature request to verify ownership
  const existing = await featureRequestRepository.findByIdWithProduct(id)
  if (!existing || existing.product.userId !== user.id) {
    notFound('Feature request not found')
  }

  try {
    const featureRequest = await featureRequestRepository.update(id, result.data!)

    return { data: featureRequest }
  } catch (error) {
    handleDbError(error)
  }
})
