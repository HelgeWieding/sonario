<script setup lang="ts">
import { STATUSES, STATUS_LABELS, CATEGORIES, CATEGORY_LABELS } from '~~/shared/constants'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const urlSlug = computed(() => route.params.slug as string)

// Get user's product and redirect if slug doesn't match
const { product, fetchProduct } = useProduct()
const { requests, loading: requestsLoading, fetchRequests, createRequest } = useFeatureRequests()

const productLoading = ref(true)
const productNotFound = ref(false)

const statusFilter = ref('')
const categoryFilter = ref('')

// Add feature request dialog state
const showAddDialog = ref(false)
const creating = ref(false)
const newRequest = ref({
  title: '',
  description: '',
  category: 'feature' as typeof CATEGORIES[number],
})

const isFormValid = computed(() =>
  newRequest.value.title.trim() && newRequest.value.description.trim()
)

const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] })),
]

const categoryOptions = [
  { value: '', label: 'All Categories' },
  ...CATEGORIES.map(c => ({ value: c, label: CATEGORY_LABELS[c] })),
]

// Category options for form (without "All" option)
const formCategoryOptions = CATEGORIES.map(c => ({ value: c, label: CATEGORY_LABELS[c] }))

async function loadRequests() {
  if (!product.value) return
  await fetchRequests({
    productId: product.value.id,
    status: statusFilter.value as any || undefined,
    category: categoryFilter.value as any || undefined,
  })
}

onMounted(async () => {
  await fetchProduct()

  if (!product.value) {
    productNotFound.value = true
    productLoading.value = false
    return
  }

  // Redirect to correct slug if URL doesn't match
  if (urlSlug.value !== product.value.slug) {
    navigateTo(`/${product.value.slug}/feature-requests`, { replace: true })
    return
  }

  productLoading.value = false
  await loadRequests()
})

watch([statusFilter, categoryFilter], () => {
  loadRequests()
})

async function handleCreateRequest() {
  if (!isFormValid.value || !product.value) return

  creating.value = true
  const result = await createRequest({
    productId: product.value.id,
    title: newRequest.value.title.trim(),
    description: newRequest.value.description.trim(),
    category: newRequest.value.category,
  })
  creating.value = false

  if (result) {
    closeAddDialog()
    await loadRequests()
    await fetchProduct() // Refresh the count
  }
}

function closeAddDialog() {
  showAddDialog.value = false
  newRequest.value = { title: '', description: '', category: 'feature' }
}
</script>

<template>
  <div>
    <div v-if="productLoading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <div v-else-if="productNotFound" class="text-center py-12">
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

    <div v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Feature Requests</h1>
          <p v-if="product.description" class="text-gray-500 mt-1">{{ product.description }}</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-2xl font-bold text-gray-900">{{ product.featureRequestCount }}</p>
            <p class="text-sm text-gray-500">feature requests</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-4 mb-6">
        <div class="w-48">
          <UiSelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Filter by status"
          />
        </div>
        <div class="w-48">
          <UiSelect
            v-model="categoryFilter"
            :options="categoryOptions"
            placeholder="Filter by category"
          />
        </div>
        <UiButton class="ml-auto" @click="showAddDialog = true">
          Add Feature Request
        </UiButton>
      </div>

      <!-- Feature Requests -->
      <div v-if="requestsLoading" class="flex justify-center py-12">
        <UiSpinner size="lg" />
      </div>

      <div v-else-if="requests.length === 0" class="text-center py-12">
        <p class="text-gray-500 mb-2">No feature requests found</p>
        <p class="text-sm text-gray-400">
          Feature requests will appear here when processed from Gmail or added manually.
        </p>
      </div>

      <DashboardFeatureRequestList
        v-else
        :requests="requests"
        :product-slug="product?.slug ?? ''"
      />
    </div>

    <!-- Add Feature Request Modal -->
    <UiModal :open="showAddDialog" title="Add Feature Request" @close="closeAddDialog">
      <form @submit.prevent="handleCreateRequest" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <UiInput
            v-model="newRequest.title"
            placeholder="Feature title"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="newRequest.description"
            rows="4"
            placeholder="Describe the feature request..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <UiSelect
            v-model="newRequest.category"
            :options="formCategoryOptions"
          />
        </div>
        <div class="flex justify-end gap-2 pt-4">
          <UiButton type="button" variant="secondary" @click="closeAddDialog">
            Cancel
          </UiButton>
          <UiButton type="submit" :loading="creating" :disabled="!isFormValid">
            Create
          </UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>
