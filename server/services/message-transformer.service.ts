import type { HelpScoutConversation, GmailMessage, NormalizedMessage } from '~~/shared/types'

/**
 * Transforms messages from different sources into a normalized format.
 * This allows consistent handling of messages regardless of their origin.
 */
export class MessageTransformerService {
  /**
   * Transform a HelpScout conversation into a normalized message
   */
  static fromHelpScout(conversation: HelpScoutConversation): NormalizedMessage {
    const threads = conversation._embedded?.threads || []
    const customerThreads = threads.filter(t => t.type === 'customer' || t.type === 'message')
    const content = customerThreads.length > 0 ? customerThreads[0].body : conversation.preview

    // Build full name from first and last
    const nameParts = [
      conversation.primaryCustomer.first,
      conversation.primaryCustomer.last,
    ].filter(Boolean)
    const fullName = nameParts.length > 0 ? nameParts.join(' ') : null

    return {
      source: 'helpscout',
      sourceId: String(conversation.id),
      sender: {
        email: conversation.primaryCustomer.email,
        name: fullName,
      },
      subject: conversation.subject,
      content: content || '',
      receivedAt: new Date(conversation.createdAt),
    }
  }

  /**
   * Transform a Gmail message into a normalized message
   */
  static fromGmail(message: GmailMessage): NormalizedMessage {
    return {
      source: 'gmail',
      sourceId: message.id,
      sourceThreadId: message.threadId,
      sender: {
        email: message.from,
        name: message.fromName,
      },
      subject: message.subject,
      content: message.body,
      receivedAt: message.receivedAt,
    }
  }
}
