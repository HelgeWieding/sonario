import type { Feedback, CreateFeedbackInput } from '~~/shared/types'

export function useFeedback() {
  const loading = useState('feedback-loading', () => false)
  const error = useState<string | null>('feedback-error', () => null)

  async function getFeedback(featureRequestId: string): Promise<Feedback[]> {
    try {
      const { data } = await $fetch<{ data: Feedback[] }>(`/api/feature-requests/${featureRequestId}/feedback`)
      return data
    } catch {
      return []
    }
  }

  async function addFeedback(input: CreateFeedbackInput): Promise<Feedback | null> {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: Feedback }>('/api/feedback', {
        method: 'POST',
        body: input,
      })
      return data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to add feedback'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteFeedback(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/feedback/${id}`, { method: 'DELETE' })
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to delete feedback'
      return false
    }
  }

  return {
    loading,
    error,
    getFeedback,
    addFeedback,
    deleteFeedback,
  }
}
