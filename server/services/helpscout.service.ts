import crypto from 'crypto'
import type {
  HelpScoutConversation,
  HelpScoutThread,
  HelpScoutMailbox,
  HelpScoutUser,
  HelpScoutTokens,
} from '~~/shared/types'

export class HelpScoutService {
  private accessToken: string
  private refreshToken: string
  private baseUrl = 'https://api.helpscout.net/v2'

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  /**
   * Generate OAuth authorization URL
   */
  static getAuthUrl(): string {
    const config = useRuntimeConfig()
    const params = new URLSearchParams({
      client_id: config.helpscoutAppId,
      redirect_uri: config.helpscoutRedirectUri,
      response_type: 'code',
    })

    return `https://secure.helpscout.net/authentication/authorizeClientApplication?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCodeForTokens(code: string): Promise<HelpScoutTokens> {
    const config = useRuntimeConfig()

    const response = await fetch('https://api.helpscout.net/v2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: config.helpscoutAppId,
        client_secret: config.helpscoutAppSecret,
        redirect_uri: config.helpscoutRedirectUri,
        code,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Token exchange failed:', error)
      throw new Error('Failed to exchange code for tokens')
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string | null> {
    const config = useRuntimeConfig()

    try {
      const response = await fetch('https://api.helpscout.net/v2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: config.helpscoutAppId,
          client_secret: config.helpscoutAppSecret,
          refresh_token: this.refreshToken,
        }),
      })

      if (!response.ok) {
        console.error('Token refresh failed:', await response.text())
        return null
      }

      const data = await response.json() as HelpScoutTokens
      this.accessToken = data.access_token
      return data.access_token
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      return null
    }
  }

  /**
   * Make authenticated API request
   */
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Help Scout API error (${endpoint}):`, error)
      throw new Error(`Help Scout API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<HelpScoutUser | null> {
    try {
      const response = await this.fetch<{ _embedded: { users: HelpScoutUser[] } }>('/users/me')
      return response._embedded?.users?.[0] || null
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  /**
   * Get all mailboxes
   */
  async getMailboxes(): Promise<HelpScoutMailbox[]> {
    try {
      const response = await this.fetch<{ _embedded: { mailboxes: HelpScoutMailbox[] } }>('/mailboxes')
      return response._embedded?.mailboxes || []
    } catch (error) {
      console.error('Failed to get mailboxes:', error)
      return []
    }
  }

  /**
   * Get a single conversation
   */
  async getConversation(conversationId: string | number): Promise<HelpScoutConversation | null> {
    try {
      return await this.fetch<HelpScoutConversation>(`/conversations/${conversationId}?embed=threads`)
    } catch (error) {
      console.error('Failed to get conversation:', error)
      return null
    }
  }

  /**
   * Get conversation threads
   */
  async getConversationThreads(conversationId: string | number): Promise<HelpScoutThread[]> {
    try {
      const response = await this.fetch<{ _embedded: { threads: HelpScoutThread[] } }>(
        `/conversations/${conversationId}/threads`
      )
      return response._embedded?.threads || []
    } catch (error) {
      console.error('Failed to get conversation threads:', error)
      return []
    }
  }

  /**
   * Get recent conversations from a mailbox
   */
  async getRecentConversations(mailboxId?: number, limit: number = 10): Promise<HelpScoutConversation[]> {
    try {
      let endpoint = `/conversations?status=all&pageSize=${limit}`
      if (mailboxId) {
        endpoint += `&mailbox=${mailboxId}`
      }

      const response = await this.fetch<{ _embedded: { conversations: HelpScoutConversation[] } }>(endpoint)
      return response._embedded?.conversations || []
    } catch (error) {
      console.error('Failed to get recent conversations:', error)
      return []
    }
  }

  /**
   * Create a draft reply in a HelpScout conversation
   */
  async createDraftReply(options: {
    conversationId: number | string
    customerEmail: string
    text: string
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${options.conversationId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: { email: options.customerEmail },
          text: options.text,
          draft: true,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error(`Failed to create draft reply for conversation ${options.conversationId}:`, error)
        return false
      }

      console.log(`Draft reply created for conversation ${options.conversationId}`)
      return true
    } catch (error) {
      console.error('Error creating draft reply:', error)
      return false
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhook(payload: string, signature: string, secret: string): boolean {
    const hash = crypto
      .createHmac('sha1', secret)
      .update(payload)
      .digest('base64')
    return hash === signature
  }
}
