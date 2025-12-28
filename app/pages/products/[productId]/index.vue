<script setup lang="ts">
import type { ProductWithStats } from '~~/shared/types'
import { STATUSES, STATUS_LABELS, CATEGORIES, CATEGORY_LABELS } from '~~/shared/constants'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const productId = route.params.productId as string

const { getProduct } = useProducts()
const { requests, loading: requestsLoading, fetchRequests, createRequest } = useFeatureRequests()

const product = ref<ProductWithStats | null>(null)
const productLoading = ref(true)

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

async function loadProduct() {
  productLoading.value = true
  product.value = await getProduct(productId)
  productLoading.value = false
}

async function loadRequests() {
  await fetchRequests({
    productId,
    status: statusFilter.value as any || undefined,
    category: categoryFilter.value as any || undefined,
  })
}

onMounted(async () => {
  await loadProduct()
  await loadRequests()
})

watch([statusFilter, categoryFilter], () => {
  loadRequests()
})

async function handleCreateRequest() {
  if (!isFormValid.value) return

  creating.value = true
  const result = await createRequest({
    productId,
    title: newRequest.value.title.trim(),
    description: newRequest.value.description.trim(),
    category: newRequest.value.category,
  })
  creating.value = false

  if (result) {
    closeAddDialog()
    await loadRequests()
    await loadProduct() // Refresh the count
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

    <div v-else-if="!product" class="text-center py-12">
      <p class="text-gray-500">Product not found</p>
      <NuxtLink to="/dashboard" class="text-primary-600 hover:underline">
        Back to Dashboard
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <NuxtLink to="/dashboard" class="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
            &larr; Back to Dashboard
          </NuxtLink>
          <h1 class="text-2xl font-bold text-gray-900">{{ product.name }}</h1>
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
        :product-id="productId"
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
