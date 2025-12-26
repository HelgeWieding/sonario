export interface GmailConnection {
  id: string
  userId: string
  email: string
  isActive: boolean
  watchExpiration: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface GmailConnectionStatus {
  isConnected: boolean
  email: string | null
  isActive: boolean
  watchExpiration: Date | null
  lastSyncAt: Date | null
}

export interface GmailMessage {
  id: string
  threadId: string
  subject: string
  from: string
  fromName: string | null
  body: string
  receivedAt: Date
}

export interface PubSubNotification {
  emailAddress: string
  historyId: string
}
