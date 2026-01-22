import { google, gmail_v1 } from 'googleapis'
import type { GmailMessage } from '~~/shared/types'

export class GmailService {
  private gmail: gmail_v1.Gmail
  private oauth2Client

  constructor(accessToken: string, refreshToken: string) {
    const config = useRuntimeConfig()

    this.oauth2Client = new google.auth.OAuth2(
      config.googleClientId,
      config.googleClientSecret,
      config.googleRedirectUri
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  static getAuthUrl(): string {
    const config = useRuntimeConfig()

    const oauth2Client = new google.auth.OAuth2(
      config.googleClientId,
      config.googleClientSecret,
      config.googleRedirectUri
    )

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.compose', // For creating draft responses
      ],
    })
  }

  static async exchangeCodeForTokens(code: string) {
    const config = useRuntimeConfig()

    const oauth2Client = new google.auth.OAuth2(
      config.googleClientId,
      config.googleClientSecret,
      config.googleRedirectUri
    )

    const { tokens } = await oauth2Client.getToken(code)
    return tokens
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken()
      return credentials.access_token || null
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      return null
    }
  }

  async getUserEmail(): Promise<string | null> {
    try {
      const profile = await this.gmail.users.getProfile({ userId: 'me' })
      return profile.data.emailAddress || null
    } catch (error) {
      console.error('Failed to get user email:', error)
      return null
    }
  }

  async getProfile(): Promise<{ email: string; historyId: string } | null> {
    try {
      const profile = await this.gmail.users.getProfile({ userId: 'me' })
      return {
        email: profile.data.emailAddress || '',
        historyId: profile.data.historyId || '',
      }
    } catch (error) {
      console.error('Failed to get profile:', error)
      return null
    }
  }

  async getRecentMessages(maxResults: number = 10): Promise<string[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        labelIds: ['INBOX'],
      })

      return (response.data.messages || []).map(m => m.id!).filter(Boolean)
    } catch (error) {
      console.error('Failed to get recent messages:', error)
      return []
    }
  }

  async setupWatch(topicName: string): Promise<{ historyId: string; expiration: Date } | null> {
    try {
      const response = await this.gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName,
          labelIds: ['INBOX'],
        },
      })

      return {
        historyId: response.data.historyId || '',
        expiration: new Date(Number(response.data.expiration)),
      }
    } catch (error) {
      console.error('Failed to setup Gmail watch:', error)
      return null
    }
  }

  async stopWatch(): Promise<boolean> {
    try {
      await this.gmail.users.stop({ userId: 'me' })
      return true
    } catch (error) {
      console.error('Failed to stop Gmail watch:', error)
      return false
    }
  }

  async getHistoryChanges(startHistoryId: string): Promise<string[]> {
    try {
      const response = await this.gmail.users.history.list({
        userId: 'me',
        startHistoryId,
        historyTypes: ['messageAdded'],
        labelId: 'INBOX', // Only get messages that landed in INBOX (excludes SPAM, TRASH)
      })

      const messageIds: string[] = []
      for (const history of response.data.history || []) {
        for (const added of history.messagesAdded || []) {
          if (added.message?.id) {
            // Double-check: only include if message has INBOX label
            const labels = added.message.labelIds || []
            if (labels.includes('INBOX') && !labels.includes('SPAM') && !labels.includes('TRASH')) {
              messageIds.push(added.message.id)
            }
          }
        }
      }

      return messageIds
    } catch (error) {
      console.error('Failed to get history changes:', error)
      return []
    }
  }

  async getMessage(messageId: string): Promise<GmailMessage | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      })

      const headers = response.data.payload?.headers || []
      const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || ''
      const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || ''
      const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || ''

      // Extract email and name from "Name <email>" format
      const fromMatch = from.match(/^(.+?)\s*<(.+)>$/)
      const fromName = fromMatch ? fromMatch?.[1]?.trim() : null
      const fromEmail = fromMatch ? fromMatch[2] : from

      // Get body content
      let body = ''
      const payload = response.data.payload

      if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
      } else if (payload?.parts) {
        // Prefer text/plain
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain')
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
        } else {
          // Fallback to text/html if no text/plain available
          const htmlPart = payload.parts.find(p => p.mimeType === 'text/html')
          if (htmlPart?.body?.data) {
            body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8')
          }
        }
      }

      return {
        id: messageId,
        threadId: response.data.threadId || '',
        subject,
        from: fromEmail,
        fromName,
        body,
        receivedAt: new Date(date),
      }
    } catch (error) {
      console.error('Failed to get message:', error)
      return null
    }
  }

  /**
   * Create a draft reply to an email
   * Returns the draft ID if successful, null otherwise
   */
  async createDraft(options: {
    to: string
    subject: string
    body: string
    threadId?: string
    inReplyTo?: string
  }): Promise<string | null> {
    try {
      // Build email headers
      const headers = [
        `To: ${options.to}`,
        `Subject: ${options.subject}`,
        'Content-Type: text/plain; charset=utf-8',
      ]

      // Add In-Reply-To header if replying to a thread
      if (options.inReplyTo) {
        headers.push(`In-Reply-To: ${options.inReplyTo}`)
        headers.push(`References: ${options.inReplyTo}`)
      }

      // Build raw email (RFC 2822 format)
      const rawEmail = [...headers, '', options.body].join('\r\n')

      // Encode to base64url (Gmail API requirement)
      const encodedMessage = Buffer.from(rawEmail)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      const requestBody: gmail_v1.Schema$Draft = {
        message: {
          raw: encodedMessage,
        },
      }

      // If replying to a thread, include the threadId
      if (options.threadId) {
        requestBody.message!.threadId = options.threadId
      }

      const response = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody,
      })

      console.log(`Draft created with ID: ${response.data.id}`)
      return response.data.id || null
    } catch (error) {
      console.error('Failed to create draft:', error)
      return null
    }
  }
}
