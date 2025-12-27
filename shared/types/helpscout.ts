// Help Scout API Types

export interface HelpScoutCustomer {
  id: number
  type: 'customer'
  first: string
  last: string
  email: string
  photoUrl?: string
}

export interface HelpScoutConversation {
  id: number
  number: number
  subject: string
  status: 'active' | 'pending' | 'closed' | 'spam'
  type: 'email' | 'chat' | 'phone'
  mailboxId: number
  createdAt: string
  closedAt: string | null
  primaryCustomer: HelpScoutCustomer
  preview: string
  _embedded?: {
    threads?: HelpScoutThread[]
  }
}

export interface HelpScoutThread {
  id: number
  type: 'customer' | 'reply' | 'note' | 'message'
  status: string
  body: string
  createdAt: string
  createdBy: {
    id: number
    type: 'customer' | 'user'
    email: string
    firstName?: string
    lastName?: string
  }
}

export interface HelpScoutMailbox {
  id: number
  name: string
  slug: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface HelpScoutUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface HelpScoutTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface HelpScoutConnectionStatus {
  isConnected: boolean
  isActive: boolean
  tokenExpiresAt: Date | null
  lastSyncAt: Date | null
}

// Help Scout webhook sends the full conversation object directly
export interface HelpScoutWebhookPayload {
  id: number
  number: number
  subject: string
  status: string
  type: string
  mailboxId: number
  createdAt: string
  primaryCustomer: {
    id: number
    email: string
    first?: string
    last?: string
  }
  _links?: {
    self: { href: string }
  }
}
