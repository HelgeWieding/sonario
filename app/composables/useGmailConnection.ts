import type { GmailConnectionStatus } from '~~/shared/types'

export function useGmailConnection() {
  const status = useState<GmailConnectionStatus | null>('gmail-status', () => null)
  const loading = useState('gmail-loading', () => false)
  const error = useState<string | null>('gmail-error', () => null)

  async function fetchStatus() {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: GmailConnectionStatus }>('/api/gmail/status')
      status.value = data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch Gmail status'
    } finally {
      loading.value = false
    }
  }

  async function initiateConnection() {
    try {
      const { data } = await $fetch<{ data: { authUrl: string } }>('/api/gmail/auth-url')
      window.location.href = data.authUrl
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to initiate Gmail connection'
    }
  }

  async function disconnect() {
    loading.value = true
    error.value = null

    try {
      await $fetch('/api/gmail/disconnect', { method: 'POST' })
      status.value = {
        isConnected: false,
        email: null,
        isActive: false,
        watchExpiration: null,
        lastSyncAt: null,
      }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to disconnect Gmail'
    } finally {
      loading.value = false
    }
  }

  async function renewWatch() {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: { expiration: string } }>('/api/gmail/watch', {
        method: 'POST',
      })
      if (status.value) {
        status.value.watchExpiration = new Date(data.expiration)
      }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to renew Gmail watch'
    } finally {
      loading.value = false
    }
  }

  async function syncNow() {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: { processed: number; message: string } }>('/api/gmail/sync', {
        method: 'POST',
      })
      return data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to sync emails'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    status,
    loading,
    error,
    fetchStatus,
    initiateConnection,
    disconnect,
    renewWatch,
    syncNow,
  }
}
