import { getDb, schema } from '~~/server/db'
import { stripHtml } from '~~/server/utils/strip-html'
import { eq } from 'drizzle-orm'

/**
 * One-time migration endpoint to strip HTML from existing processed messages and feedback.
 * Call this once after deploying the HTML stripping feature.
 *
 * POST /api/admin/migrate-strip-html
 */
export default defineEventHandler(async (event) => {
  const db = getDb()

  // Migrate processed messages
  const messages = await db
    .select({
      id: schema.processedMessages.id,
      content: schema.processedMessages.content,
    })
    .from(schema.processedMessages)

  let messagesUpdated = 0
  let messagesSkipped = 0

  for (const message of messages) {
    if (!message.content || !message.content.includes('<')) {
      messagesSkipped++
      continue
    }

    const strippedContent = stripHtml(message.content)

    if (strippedContent !== message.content) {
      await db
        .update(schema.processedMessages)
        .set({ content: strippedContent })
        .where(eq(schema.processedMessages.id, message.id))
      messagesUpdated++
    } else {
      messagesSkipped++
    }
  }

  // Migrate feedback
  const feedbackItems = await db
    .select({
      id: schema.feedback.id,
      content: schema.feedback.content,
    })
    .from(schema.feedback)

  let feedbackUpdated = 0
  let feedbackSkipped = 0

  for (const item of feedbackItems) {
    if (!item.content || !item.content.includes('<')) {
      feedbackSkipped++
      continue
    }

    const strippedContent = stripHtml(item.content)

    if (strippedContent !== item.content) {
      await db
        .update(schema.feedback)
        .set({ content: strippedContent })
        .where(eq(schema.feedback.id, item.id))
      feedbackUpdated++
    } else {
      feedbackSkipped++
    }
  }

  return {
    success: true,
    messages: {
      total: messages.length,
      updated: messagesUpdated,
      skipped: messagesSkipped,
    },
    feedback: {
      total: feedbackItems.length,
      updated: feedbackUpdated,
      skipped: feedbackSkipped,
    },
  }
})
