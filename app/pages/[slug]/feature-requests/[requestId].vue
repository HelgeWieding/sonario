<script setup lang="ts">
import type { FeatureRequestWithFeedback } from '~~/shared/types'
import { STATUS_LABELS, CATEGORY_LABELS, STATUSES, CATEGORIES } from '~~/shared/constants'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const urlSlug = computed(() => route.params.slug as string)
const requestId = route.params.requestId as string

// Get user's product and redirect if slug doesn't match
const { product, fetchProduct } = useProduct()
const productNotFound = ref(false)

const { getRequest, updateRequest, deleteRequest } = useFeatureRequests()
const { addFeedback, deleteFeedback } = useFeedback()
const router = useRouter()

const request = ref<FeatureRequestWithFeedback | null>(null)
const loading = ref(true)
const updating = ref(false)
const showDeleteModal = ref(false)

const newFeedback = ref('')
const addingFeedback = ref(false)

async function loadRequest() {
  loading.value = true
  request.value = await getRequest(requestId)
  loading.value = false
}

async function handleStatusChange(status: string) {
  if (!request.value) return
  updating.value = true
  await updateRequest(requestId, { status: status as any })
  await loadRequest()
  updating.value = false
}

async function handleDelete() {
  const success = await deleteRequest(requestId)
  if (success) {
    router.push(`/${product.value?.slug}/feature-requests`)
  }
}

async function handleAddFeedback() {
  if (!newFeedback.value.trim()) return
  addingFeedback.value = true
  const feedback = await addFeedback({
    featureRequestId: requestId,
    content: newFeedback.value,
  })
  if (feedback) {
    newFeedback.value = ''
    await loadRequest()
  }
  addingFeedback.value = false
}

async function handleDeleteFeedback(feedbackId: string) {
  const success = await deleteFeedback(feedbackId)
  if (success) {
    await loadRequest()
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
    navigateTo(`/${product.value.slug}/feature-requests/${requestId}`, { replace: true })
    return
  }

  loadRequest()
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

    <div v-else-if="loading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <div v-else-if="!request" class="text-center py-12">
      <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-900 mb-2">Feature request not found</h2>
      <p class="text-gray-500 mb-4">This feature request doesn't exist or has been deleted.</p>
      <NuxtLink :to="`/${product?.slug}/feature-requests`" class="text-primary-600 hover:underline">
        Back to Feature Requests
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink :to="`/${product?.slug}/feature-requests`" class="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
          &larr; Back to Feature Requests
        </NuxtLink>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <UiCard>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-xl font-bold text-gray-900">{{ request.title }}</h1>
                <div class="flex items-center gap-2 mt-2">
                  <UiBadge>{{ CATEGORY_LABELS[request.category] }}</UiBadge>
                  <span v-if="request.aiGenerated" class="text-sm text-primary-600">AI Generated</span>
                </div>
              </div>
              <UiButton variant="ghost" size="sm" @click="showDeleteModal = true">Delete</UiButton>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 whitespace-pre-wrap">{{ request.description }}</p>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-sm text-gray-500">
                Created {{ new Date(request.createdAt).toLocaleDateString() }}
                <span v-if="request.sourceEmailId" class="ml-2">from email</span>
              </p>
            </div>
          </UiCard>

          <!-- Feedback Section -->
          <div class="mt-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              Feedback ({{ request.feedback.length }})
            </h2>

            <!-- Add Feedback -->
            <UiCard class="mb-4">
              <textarea
                v-model="newFeedback"
                class="input"
                rows="3"
                placeholder="Add feedback..."
              />
              <div class="mt-2 flex justify-end">
                <UiButton size="sm" :loading="addingFeedback" @click="handleAddFeedback">
                  Add Feedback
                </UiButton>
              </div>
            </UiCard>

            <!-- Feedback List -->
            <div class="space-y-3">
              <UiCard v-for="fb in request.feedback" :key="fb.id">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-gray-700">{{ fb.content }}</p>
                    <div class="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <span v-if="fb.senderEmail">{{ fb.senderName || fb.senderEmail }}</span>
                      <span>{{ new Date(fb.createdAt).toLocaleDateString() }}</span>
                      <UiBadge
                        v-if="fb.sentiment"
                        size="sm"
                        :variant="fb.sentiment === 'positive' ? 'success' : fb.sentiment === 'negative' ? 'error' : 'default'"
                      >
                        {{ fb.sentiment }}
                      </UiBadge>
                      <UiBadge v-if="fb.aiExtracted" size="sm">AI Extracted</UiBadge>
                    </div>
                  </div>
                  <UiButton variant="ghost" size="sm" @click="handleDeleteFeedback(fb.id)">
                    Remove
                  </UiButton>
                </div>
              </UiCard>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div>
          <UiCard>
            <h3 class="font-semibold text-gray-900 mb-4">Status</h3>
            <select
              :value="request.status"
              class="input"
              :disabled="updating"
              @change="handleStatusChange(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="status in STATUSES" :key="status" :value="status">
                {{ STATUS_LABELS[status] }}
              </option>
            </select>

            <div class="mt-6">
              <h3 class="font-semibold text-gray-900 mb-2">Statistics</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Feedback Count</span>
                  <span class="font-medium">{{ request.feedbackCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Category</span>
                  <span class="font-medium">{{ CATEGORY_LABELS[request.category] }}</span>
                </div>
              </div>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <UiModal :open="showDeleteModal" title="Delete Feature Request" @close="showDeleteModal = false">
      <p class="text-gray-600">Are you sure you want to delete this feature request? This action cannot be undone.</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showDeleteModal = false">Cancel</UiButton>
          <UiButton variant="danger" @click="handleDelete">Delete</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
