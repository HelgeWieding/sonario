import { eq } from 'drizzle-orm'
import { PubSubService } from '../../services/pubsub.service'
import { EmailProcessorService } from '../../services/email-processor.service'
import { getDb, schema } from '../../db'

export default defineEventHandler(async (event) => {
  const db = getDb()

  // Verify the request is from Google
  if (!PubSubService.verifyRequest(event)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    })
  }

  const body = await readBody(event)
  const notification = PubSubService.parseNotification(body)

  if (!notification) {
    // Return 200 to acknowledge receipt even if we can't process
    return { received: true }
  }

  console.log('Received Gmail notification for:', notification.emailAddress)

  // Find the Gmail connection by email
  const connection = await db.query.gmailConnections.findFirst({
    where: eq(schema.gmailConnections.email, notification.emailAddress),
  })

  if (!connection || !connection.isActive) {
    console.log('No active connection found for:', notification.emailAddress)
    return { received: true }
  }

  try {
    // Process new emails
    await EmailProcessorService.processNewEmails(connection, notification.historyId)

    // Update the history ID
    await db
      .update(schema.gmailConnections)
      .set({
        historyId: notification.historyId,
        updatedAt: new Date(),
      })
      .where(eq(schema.gmailConnections.id, connection.id))
  } catch (error) {
    console.error('Error processing emails:', error)
    // Still return 200 to acknowledge receipt
  }

  return { received: true }
})
