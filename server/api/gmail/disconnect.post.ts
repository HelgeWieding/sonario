import { eq } from 'drizzle-orm'
import { GmailService } from '../../services/gmail.service'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { notFound } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  // Get user's product
  const product = await db.query.products.findFirst({
    where: eq(schema.products.userId, user.id),
  })

  if (!product) {
    notFound('Product not found')
  }

  const connection = await db.query.gmailConnections.findFirst({
    where: eq(schema.gmailConnections.productId, product.id),
  })

  if (!connection) {
    notFound('Gmail connection not found')
  }

  try {
    // Stop the Gmail watch
    const gmailService = new GmailService(connection.accessToken, connection.refreshToken)
    await gmailService.stopWatch()
  } catch (error) {
    console.error('Failed to stop Gmail watch:', error)
  }

  // Delete the connection
  await db.delete(schema.gmailConnections).where(eq(schema.gmailConnections.id, connection.id))

  return { data: { success: true } }
})
