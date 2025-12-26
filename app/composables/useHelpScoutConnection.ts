import type { HelpScoutConnectionStatus } from '~~/shared/types'

export function useHelpScoutConnection() {
  const status = useState<HelpScoutConnectionStatus | null>('helpscout-status', () => null)
  const loading = useState('helpscout-loading', () => false)
  const error = useState<string | null>('helpscout-error', () => null)

  async function fetchStatus() {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: HelpScoutConnectionStatus }>('/api/helpscout/status')
      status.value = data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch Help Scout status'
    } finally {
      loading.value = false
    }
  }

  async function initiateConnection() {
    try {
      const { data } = await $fetch<{ data: { authUrl: string } }>('/api/helpscout/auth-url')
      window.location.href = data.authUrl
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to initiate Help Scout connection'
    }
  }

  async function disconnect() {
    loading.value = true
    error.value = null

    try {
      await $fetch('/api/helpscout/disconnect', { method: 'POST' })
      status.value = {
        isConnected: false,
        isActive: false,
        tokenExpiresAt: null,
        lastSyncAt: null,
      }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to disconnect Help Scout'
    } finally {
      loading.value = false
    }
  }

  async function syncNow() {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: { processed: number; message: string } }>('/api/helpscout/sync', {
        method: 'POST',
      })
      return data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to sync conversations'
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
    syncNow,
  }
}
