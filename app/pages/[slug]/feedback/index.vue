<script setup lang="ts">
import type { Feedback } from '~~/server/db/schema/feedback'
import type { FeatureRequest } from '~~/shared/types'
import { SENTIMENT_LABELS, SENTIMENTS } from '~~/shared/constants/enums'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const urlSlug = computed(() => route.params.slug as string)

// Get user's product and redirect if slug doesn't match
const { product, fetchProduct } = useProduct()
const productNotFound = ref(false)

interface FeedbackWithRelations extends Feedback {
  featureRequest?: { id: string; title: string } | null
  contact?: { id: string; email: string; name: string | null } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const { addFeedback } = useFeedback()

const loading = ref(true)
const feedbackList = ref<FeedbackWithRelations[]>([])
const pagination = ref<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
const sentimentFilter = ref('')
const expandedItems = ref<Set<string>>(new Set())

// Add feedback dialog state
const showAddDialog = ref(false)
const creating = ref(false)
const featureRequests = ref<FeatureRequest[]>([])
const loadingRequests = ref(false)
const newFeedback = ref({
  featureRequestId: '',
  content: '',
  sentiment: 'neutral' as typeof SENTIMENTS[number],
  senderEmail: '',
  senderName: '',
})

const isFormValid = computed(() =>
  product.value && newFeedback.value.content.trim()
)

const sentimentOptions = [
  { value: '', label: 'All Sentiments' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

const formSentimentOptions = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

const featureRequestOptions = computed(() => [
  { value: '', label: 'None (standalone feedback)' },
  ...featureRequests.value.map(r => ({ value: r.id, label: r.title })),
])

async function loadFeatureRequests() {
  if (!product.value) {
    featureRequests.value = []
    return
  }
  loadingRequests.value = true
  try {
    const { data } = await $fetch<{ data: FeatureRequest[] }>(`/api/feature-requests?productId=${product.value.id}`)
    featureRequests.value = data
  } catch (error) {
    console.error('Failed to load feature requests:', error)
    featureRequests.value = []
  } finally {
    loadingRequests.value = false
  }
}

async function loadFeedback(page = 1) {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (sentimentFilter.value) params.set('sentiment', sentimentFilter.value)

    const response = await $fetch<{ data: FeedbackWithRelations[]; pagination: Pagination }>(`/api/feedback?${params}`)
    feedbackList.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load feedback:', error)
  } finally {
    loading.value = false
  }
}

function toggleExpand(id: string) {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

function isExpanded(id: string) {
  return expandedItems.value.has(id)
}

function getSentimentBadgeColor(sentiment: string) {
  switch (sentiment) {
    case 'positive': return 'bg-green-100 text-green-800'
    case 'negative': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function goToPage(page: number) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadFeedback(page)
  }
}

function truncateContent(content: string, maxLength = 100) {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength) + '...'
}

async function openAddDialog() {
  showAddDialog.value = true
  if (product.value) {
    await loadFeatureRequests()
  }
}

function closeAddDialog() {
  showAddDialog.value = false
  newFeedback.value = {
    featureRequestId: '',
    content: '',
    sentiment: 'neutral',
    senderEmail: '',
    senderName: '',
  }
}

async function handleCreateFeedback() {
  if (!isFormValid.value || !product.value) return

  creating.value = true
  const result = await addFeedback({
    productId: product.value.id,
    featureRequestId: newFeedback.value.featureRequestId || undefined,
    content: newFeedback.value.content.trim(),
    sentiment: newFeedback.value.sentiment,
    senderEmail: newFeedback.value.senderEmail.trim() || undefined,
    senderName: newFeedback.value.senderName.trim() || undefined,
  })
  creating.value = false

  if (result) {
    closeAddDialog()
    await loadFeedback(1)
  }
}

onMounted(async () => {
  await fetchProduct()

  if (!product.value) {
    productNotFound.value = true
    loading.value = false
    return
  }

  // Redirect to correct slug if URL doesn't match
  if (urlSlug.value !== product.value.slug) {
    navigateTo(`/${product.value.slug}/feedback`, { replace: true })
    return
  }

  loadFeedback()
})

watch([sentimentFilter], () => {
  expandedItems.value.clear()
  loadFeedback(1)
})
</script>

<template>
  <div>
    <!-- Product not found -->
    <div v-if="productNotFound" class="text-center py-12">
      <div class="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-600">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-900 mb-2">Product not found</h2>
      <p class="text-gray-500 mb-4">The product "{{ urlSlug }}" does not exist.</p>
      <NuxtLink to="/dashboard" class="text-primary-600 hover:underline">
        Go to Dashboard
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Feedback</h1>
        <p class="text-gray-500 mt-1">All feedback collected from various sources</p>
      </div>

      <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="w-48 flex-shrink-0">
        <UiSelect
          v-model="sentimentFilter"
          :options="sentimentOptions"
          placeholder="Filter by sentiment"
        />
      </div>
      <UiButton class="ml-auto" @click="openAddDialog">
        Add Feedback
      </UiButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <div v-else-if="feedbackList.length === 0" class="text-center py-12">
      <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      </div>
      <p class="text-gray-500 mb-2">No feedback found</p>
      <p class="text-sm text-gray-400">
        Feedback will appear here when extracted from emails or added manually.
      </p>
    </div>

    <!-- Feedback list -->
    <template v-else>
      <div class="space-y-3">
        <div
          v-for="item in feedbackList"
          :key="item.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <!-- Header row - always visible, clickable -->
          <button
            type="button"
            class="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            @click="toggleExpand(item.id)"
          >
            <div class="flex items-start gap-4">
              <!-- Expand icon -->
              <div class="flex-shrink-0 mt-0.5">
                <svg
                  :class="['w-4 h-4 text-gray-400 transition-transform', isExpanded(item.id) ? 'rotate-90' : '']"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <!-- Preview of content -->
                <p class="text-gray-900 truncate">
                  {{ truncateContent(item.content) }}
                </p>

                <!-- Sender info -->
                <p class="text-sm text-gray-500 mt-0.5 truncate">
                  <span v-if="item.senderName">{{ item.senderName }}</span>
                  <span v-if="item.senderEmail" class="text-gray-400">
                    {{ item.senderName ? ` <${item.senderEmail}>` : item.senderEmail }}
                  </span>
                  <span v-if="!item.senderName && !item.senderEmail" class="text-gray-400">
                    Unknown sender
                  </span>
                </p>
              </div>

              <!-- Badges -->
              <div class="flex flex-shrink-0 items-center gap-2">
                <span
                  :class="[getSentimentBadgeColor(item.sentiment), 'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap']"
                >
                  {{ SENTIMENT_LABELS[item.sentiment as keyof typeof SENTIMENT_LABELS] || item.sentiment }}
                </span>
                <span
                  v-if="item.aiExtracted"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 whitespace-nowrap"
                >
                  AI Extracted
                </span>
                <span class="text-xs text-gray-400 whitespace-nowrap">
                  {{ formatDate(item.createdAt) }}
                </span>
              </div>
            </div>
          </button>

          <!-- Expanded content -->
          <div v-if="isExpanded(item.id)" class="px-4 pb-4 border-t border-gray-100">
            <div class="pt-4 pl-8">
              <!-- Full content -->
              <div class="bg-gray-50 rounded-lg p-4 mb-3">
                <p class="text-sm text-gray-700 whitespace-pre-wrap break-words">{{ item.content }}</p>
              </div>

              <!-- Related feature request -->
              <div v-if="item.featureRequest" class="text-sm mb-2">
                <span class="text-gray-500">Related to: </span>
                <NuxtLink
                  :to="`/${product?.slug}/feature-requests/${item.featureRequest.id}`"
                  class="text-blue-600 hover:text-blue-800"
                >
                  {{ item.featureRequest.title }}
                </NuxtLink>
              </div>

              <!-- Contact link -->
              <div v-if="item.contact" class="text-sm">
                <span class="text-gray-500">Contact: </span>
                <NuxtLink
                  :to="`/${product?.slug}/contacts/${item.contact.id}`"
                  class="text-blue-600 hover:text-blue-800"
                >
                  {{ item.contact.name || item.contact.email }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="mt-6 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} feedback items
        </p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="pagination.page === 1"
            class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="goToPage(pagination.page - 1)"
          >
            Previous
          </button>
          <span class="text-sm text-gray-500">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </span>
          <button
            type="button"
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="goToPage(pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
      </template>

      <!-- Add Feedback Modal -->
      <UiModal :open="showAddDialog" title="Add Feedback" @close="closeAddDialog">
        <form @submit.prevent="handleCreateFeedback" class="space-y-4">
          <!-- Content -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Feedback Content</label>
            <textarea
              v-model="newFeedback.content"
              rows="4"
              placeholder="Enter the feedback..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Sentiment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
            <UiSelect
              v-model="newFeedback.sentiment"
              :options="formSentimentOptions"
            />
          </div>

          <!-- Feature Request Link -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Link to Feature Request</label>
            <UiSelect
              v-model="newFeedback.featureRequestId"
              :options="featureRequestOptions"
              :disabled="loadingRequests"
              placeholder="Select a feature request (optional)"
            />
            <p class="text-xs text-gray-500 mt-1">Optionally link this feedback to an existing feature request</p>
          </div>

          <!-- Sender Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
              <UiInput
                v-model="newFeedback.senderName"
                placeholder="Optional"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
              <UiInput
                v-model="newFeedback.senderEmail"
                type="email"
                placeholder="Optional"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <UiButton type="button" variant="secondary" @click="closeAddDialog">
              Cancel
            </UiButton>
            <UiButton type="submit" :loading="creating" :disabled="!isFormValid">
              Add Feedback
            </UiButton>
          </div>
        </form>
      </UiModal>
    </template>
  </div>
</template>
