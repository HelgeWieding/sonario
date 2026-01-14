<script setup lang="ts">
import type { ProcessedMessage } from "~~/server/db/schema/processed-messages";
import type { FeatureRequest } from "~~/shared/types";
import { SENTIMENTS } from "~~/shared/constants/enums";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const { product, fetchProductServer } = useProduct();

await fetchProductServer(slug);


interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const loading = ref(true)
const messages = ref<ProcessedMessage[]>([])
const pagination = ref<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
const sourceFilter = ref('')
const featureRequestFilter = ref('')
const expandedMessages = ref<Set<string>>(new Set())

// Add as feedback dialog state
const showAddFeedbackDialog = ref(false)
const creatingFeedback = ref(false)
const featureRequests = ref<FeatureRequest[]>([])
const loadingRequests = ref(false)
const newFeedback = ref({
  featureRequestId: '',
  content: '',
  sentiment: 'neutral' as typeof SENTIMENTS[number],
  senderEmail: '',
  senderName: '',
})

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'gmail', label: 'Gmail' },
  { value: 'helpscout', label: 'Help Scout' },
]

const featureRequestFilterOptions = [
  { value: '', label: 'All Messages' },
  { value: 'true', label: 'Feature Requests Only' },
  { value: 'false', label: 'Non-Feature Requests' },
]

const feedbackFeatureRequestOptions = computed(() => [
  { value: '', label: 'None (standalone feedback)' },
  ...featureRequests.value.map(r => ({ value: r.id, label: r.title })),
])

const formSentimentOptions = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

const isFormValid = computed(() =>
  product.value && newFeedback.value.content.trim()
)

async function loadMessages(page = 1) {
  if (!product.value) return;
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (sourceFilter.value) params.set("source", sourceFilter.value);
    if (featureRequestFilter.value)
      params.set("isFeatureRequest", featureRequestFilter.value);

    const response = await $fetch<{
      data: ProcessedMessage[];
      pagination: Pagination;
    }>(`/api/${route.params.slug}/messages?${params}`);
    messages.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error("Failed to load messages:", error);
  } finally {
    loading.value = false;
  }
}

function toggleExpand(messageId: string) {
  if (expandedMessages.value.has(messageId)) {
    expandedMessages.value.delete(messageId)
  } else {
    expandedMessages.value.add(messageId)
  }
}

function isExpanded(messageId: string) {
  return expandedMessages.value.has(messageId)
}

function getSourceBadgeColor(source: string) {
  switch (source) {
    case 'gmail': return 'bg-red-100 text-red-800'
    case 'helpscout': return 'bg-blue-100 text-blue-800'
    case 'hubspot': return 'bg-orange-100 text-orange-800'
    case 'zendesk': return 'bg-green-100 text-green-800'
    case 'zoho': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getSourceLabel(source: string) {
  switch (source) {
    case 'gmail': return 'Gmail'
    case 'helpscout': return 'Help Scout'
    case 'hubspot': return 'HubSpot'
    case 'zendesk': return 'Zendesk'
    case 'zoho': return 'Zoho'
    default: return source
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
    loadMessages(page)
  }
}

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

async function openAddAsFeedbackDialog(message: ProcessedMessage) {
  newFeedback.value = {
    featureRequestId: '',
    content: message.content || '',
    sentiment: 'neutral',
    senderEmail: message.senderEmail || '',
    senderName: message.senderName || '',
  }
  showAddFeedbackDialog.value = true
  if (featureRequests.value.length === 0) {
    await loadFeatureRequests()
  }
}

function closeAddFeedbackDialog() {
  showAddFeedbackDialog.value = false
  newFeedback.value = {
    featureRequestId: '',
    content: '',
    sentiment: 'neutral',
    senderEmail: '',
    senderName: '',
  }
}

async function handleCreateFeedback() {
  if (!isFormValid.value || !product.value) return;

  creatingFeedback.value = true;
  try {
    await $fetch(`/api/${route.params.slug}/feedback`, {
      method: "POST",
      body: {
        featureRequestId: newFeedback.value.featureRequestId || undefined,
        content: newFeedback.value.content.trim(),
        sentiment: newFeedback.value.sentiment,
        senderEmail: newFeedback.value.senderEmail.trim() || undefined,
        senderName: newFeedback.value.senderName.trim() || undefined,
      },
    });
    closeAddFeedbackDialog();
  } catch (error) {
    console.error("Failed to create feedback:", error);
  } finally {
    creatingFeedback.value = false;
  }
}

onMounted(() => {
  loadMessages()
})

watch([sourceFilter, featureRequestFilter], () => {
  expandedMessages.value.clear()
  loadMessages(1)
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Messages</h1>
      <p class="text-gray-500 mt-1">All processed messages from connected sources</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="w-48 flex-shrink-0">
        <UiSelect
          v-model="sourceFilter"
          :options="sourceOptions"
          placeholder="Filter by source"
        />
      </div>
      <div class="w-56 flex-shrink-0">
        <UiSelect
          v-model="featureRequestFilter"
          :options="featureRequestFilterOptions"
          placeholder="Filter by type"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <div v-else-if="messages.length === 0" class="text-center py-12">
      <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </div>
      <p class="text-gray-500 mb-2">No messages found</p>
      <p class="text-sm text-gray-400">
        Messages will appear here when processed from Gmail or Help Scout.
      </p>
    </div>

    <!-- Messages list -->
    <template v-else>
      <div class="space-y-3">
        <div
          v-for="message in messages"
          :key="message.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <!-- Header row - always visible, clickable -->
          <button
            type="button"
            class="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            @click="toggleExpand(message.id)"
          >
            <div class="flex items-start gap-4">
              <!-- Expand icon -->
              <div class="flex-shrink-0 mt-0.5">
                <svg
                  :class="['w-4 h-4 text-gray-400 transition-transform', isExpanded(message.id) ? 'rotate-90' : '']"
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
                <!-- Subject -->
                <h3 class="font-medium text-gray-900 truncate">
                  {{ message.subject || '(No subject)' }}
                </h3>

                <!-- Sender -->
                <p class="text-sm text-gray-500 mt-0.5 truncate">
                  <span v-if="message.senderName">{{ message.senderName }}</span>
                  <span v-if="message.senderEmail" class="text-gray-400">
                    {{ message.senderName ? ` <${message.senderEmail}>` : message.senderEmail }}
                  </span>
                </p>
              </div>

              <!-- Badges -->
              <div class="flex flex-shrink-0 items-center gap-2">
                <span
                  :class="[getSourceBadgeColor(message.source), 'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap']"
                >
                  {{ getSourceLabel(message.source) }}
                </span>
                <span
                  v-if="message.isFeatureRequest"
                  class="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-900 whitespace-nowrap"
                >
                  Feature Request
                </span>
                <span class="text-xs text-gray-400 whitespace-nowrap">
                  {{ formatDate(message.processedAt) }}
                </span>
              </div>
            </div>
          </button>

          <!-- Expanded content -->
          <div v-if="isExpanded(message.id)" class="px-4 pb-4 border-t border-gray-100">
            <div class="pt-4 pl-8">
              <!-- Full content -->
              <div v-if="message.content" class="bg-gray-50 rounded-lg p-4 mb-3">
                <p class="text-sm text-gray-700 whitespace-pre-wrap break-words">{{ message.content }}</p>
              </div>
              <div v-else class="text-sm text-gray-400 italic mb-3">
                No content available
              </div>

              <!-- Links if feature request was created -->
              <div v-if="message.featureRequestId || message.feedbackId" class="text-sm mb-3">
                <span v-if="message.featureRequestId" class="text-blue-600">
                  Created feature request
                </span>
                <span v-else-if="message.feedbackId" class="text-blue-600">
                  Added as feedback
                </span>
              </div>

              <!-- Actions -->
              <div v-if="!message.feedbackId" class="flex items-center gap-2">
                <UiButton
                  size="sm"
                  variant="secondary"
                  @click.stop="openAddAsFeedbackDialog(message)"
                >
                  Add as Feedback
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="mt-6 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} messages
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

    <!-- Add as Feedback Modal -->
    <UiModal :open="showAddFeedbackDialog" title="Add as Feedback" @close="closeAddFeedbackDialog">
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
            :options="feedbackFeatureRequestOptions"
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
          <UiButton type="button" variant="secondary" @click="closeAddFeedbackDialog">
            Cancel
          </UiButton>
          <UiButton type="submit" :loading="creatingFeedback" :disabled="!isFormValid">
            Add Feedback
          </UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>
