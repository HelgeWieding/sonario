import type { PubSubNotification } from '~~/shared/types'

export class PubSubService {
  /**
   * Parse a Pub/Sub push notification
   */
  static parseNotification(body: any): PubSubNotification | null {
    try {
      if (!body?.message?.data) {
        return null
      }

      const data = Buffer.from(body.message.data, 'base64').toString('utf-8')
      const parsed = JSON.parse(data)

      return {
        emailAddress: parsed.emailAddress,
        historyId: parsed.historyId,
      }
    } catch (error) {
      console.error('Failed to parse Pub/Sub notification:', error)
      return null
    }
  }

  /**
   * Verify that the request is from Google Pub/Sub
   * In production, you should verify the JWT token
   */
  static verifyRequest(_event: any): boolean {
    // TODO: Implement proper JWT verification for production
    // See: https://cloud.google.com/pubsub/docs/push#authentication
    return true
  }
}
