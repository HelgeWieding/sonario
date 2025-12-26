import { eq } from 'drizzle-orm'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound, handleDbError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    notFound('Feature request not found')
  }

  // Get the feature request to verify ownership
  const existing = await db.query.featureRequests.findFirst({
    where: eq(schema.featureRequests.id, id),
    with: { product: true },
  })

  if (!existing || existing.product.userId !== user.id) {
    notFound('Feature request not found')
  }

  try {
    await db.delete(schema.featureRequests).where(eq(schema.featureRequests.id, id))
    return { data: { success: true } }
  } catch (error) {
    handleDbError(error)
  }
})
