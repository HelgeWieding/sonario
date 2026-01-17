<script setup lang="ts">
import type { Feedback } from "~~/server/db/schema/feedback";
import type { FeatureRequest } from "~~/shared/types";
import type { Sentiment } from "~~/shared/constants/enums";
import { SENTIMENT_LABELS } from "~~/shared/constants/enums";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const { product, fetchProductServer } = useProduct();

await fetchProductServer(slug);

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

const loading = ref(true)
const feedbackList = ref<FeedbackWithRelations[]>([])
const pagination = ref<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
const sentimentFilter = ref('')
const expandedItems = ref<Set<string>>(new Set())

// Feature requests for modals
const featureRequests = ref<FeatureRequest[]>([])
const loadingRequests = ref(false)

// Modal states using composable
const addModal = useModal({
  async onOpen() {
    if (product.value) {
      await loadFeatureRequests()
    }
  },
})

const linkModal = useModal({
  async onOpen() {
    if (featureRequests.value.length === 0) {
      await loadFeatureRequests()
    }
  },
})

const deleteModal = useModal()

// Modal-related state
const selectedFeedbackForLink = ref<FeedbackWithRelations | null>(null)
const feedbackToDelete = ref<FeedbackWithRelations | null>(null)
const creating = ref(false)
const linking = ref(false)
const deleting = ref(false)

const sentimentOptions = [
  { value: '', label: 'All Sentiments' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

async function loadFeatureRequests() {
  if (!product.value) {
    featureRequests.value = [];
    return;
  }
  loadingRequests.value = true;
  try {
    const { data } = await $fetch<{ data: FeatureRequest[] }>(
      `/api/${route.params.slug}/feature-requests?productId=${product.value.id}`
    );
    featureRequests.value = data;
  } catch (error) {
    console.error("Failed to load feature requests:", error);
    featureRequests.value = [];
  } finally {
    loadingRequests.value = false;
  }
}

async function loadFeedback(page = 1) {
  if (!product.value) return;
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (sentimentFilter.value) params.set("sentiment", sentimentFilter.value);

    const response = await $fetch<{
      data: FeedbackWithRelations[];
      pagination: Pagination;
    }>(`/api/${route.params.slug}/feedback?${params}`);
    feedbackList.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error("Failed to load feedback:", error);
  } finally {
    loading.value = false;
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

interface FeedbackForm {
  featureRequestId: string
  content: string
  sentiment: Sentiment
  senderEmail: string
  senderName: string
}

async function handleCreateFeedback(form: FeedbackForm) {
  if (!product.value) return

  creating.value = true
  try {
    await $fetch(`/api/${route.params.slug}/feedback`, {
      method: "POST",
      body: {
        featureRequestId: form.featureRequestId || undefined,
        content: form.content.trim(),
        sentiment: form.sentiment,
        senderEmail: form.senderEmail.trim() || undefined,
        senderName: form.senderName.trim() || undefined,
      },
    })
    addModal.close()
    await loadFeedback(1)
  } catch (error) {
    console.error("Failed to create feedback:", error)
  } finally {
    creating.value = false
  }
}

function openLinkModal(feedback: FeedbackWithRelations) {
  selectedFeedbackForLink.value = feedback
  linkModal.open()
}

async function handleLinkToFeatureRequest(featureRequestId: string | null) {
  if (!selectedFeedbackForLink.value) return

  linking.value = true
  try {
    await $fetch(`/api/${route.params.slug}/feedback/${selectedFeedbackForLink.value.id}`, {
      method: "PATCH",
      body: {
        featureRequestId: featureRequestId,
      },
    })
    linkModal.close()
    selectedFeedbackForLink.value = null
    await loadFeedback(pagination.value.page)
  } catch (error) {
    console.error("Failed to link feedback to feature request:", error)
  } finally {
    linking.value = false
  }
}

function openDeleteModal(item: FeedbackWithRelations) {
  feedbackToDelete.value = item
  deleteModal.open()
}

async function handleDeleteFeedback() {
  if (!feedbackToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/${route.params.slug}/feedback/${feedbackToDelete.value.id}`, {
      method: "DELETE",
    })
    deleteModal.close()
    feedbackToDelete.value = null
    await loadFeedback(pagination.value.page)
  } catch (error) {
    console.error("Failed to delete feedback:", error)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadFeedback()
})

watch([sentimentFilter], () => {
  expandedItems.value.clear()
  loadFeedback(1)
})
</script>

<template>
  <div>
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
      <UiButton class="ml-auto" @click="addModal.open">
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
                <!-- Link to feature request button -->
                <button
                  v-if="item.featureRequest"
                  type="button"
                  class="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-900 hover:bg-gray-50 max-w-[150px] truncate"
                  :title="item.featureRequest.title"
                  @click.stop="openLinkModal(item)"
                >
                  {{ item.featureRequest.title }}
                </button>
                <button
                  v-else
                  type="button"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 whitespace-nowrap"
                  @click.stop="openLinkModal(item)"
                >
                  Add to feature request
                </button>
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

              <!-- Actions -->
              <div class="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <UiButton
                  size="sm"
                  variant="danger"
                  @click.stop="openDeleteModal(item)"
                >
                  Delete
                </UiButton>
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
    <FeedbackAddFeedbackModal
      :open="addModal.isOpen.value"
      :feature-requests="featureRequests"
      :loading-requests="loadingRequests"
      @close="addModal.close"
      @submit="handleCreateFeedback"
    />

    <!-- Link to Feature Request Modal -->
    <FeedbackLinkFeedbackModal
      :open="linkModal.isOpen.value"
      :feature-requests="featureRequests"
      :current-feature-request-id="selectedFeedbackForLink?.featureRequest?.id"
      :loading-requests="loadingRequests"
      @close="linkModal.close"
      @submit="handleLinkToFeatureRequest"
    />

    <!-- Delete Confirmation Modal -->
    <UiConfirmModal
      :open="deleteModal.isOpen.value"
      title="Delete Feedback"
      message="Are you sure you want to delete this feedback? This action cannot be undone."
      confirm-text="Delete"
      confirm-variant="danger"
      :loading="deleting"
      @close="deleteModal.close"
      @confirm="handleDeleteFeedback"
    >
      <div v-if="feedbackToDelete" class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
        {{ feedbackToDelete.content.length > 100 ? feedbackToDelete.content.slice(0, 100) + '...' : feedbackToDelete.content }}
      </div>
    </UiConfirmModal>
  </div>
</template>
