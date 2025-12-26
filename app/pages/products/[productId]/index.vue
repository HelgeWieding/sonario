<script setup lang="ts">
import type { ProductWithStats } from '~~/shared/types'
import { STATUSES, STATUS_LABELS, CATEGORIES, CATEGORY_LABELS } from '~~/shared/constants'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const productId = route.params.productId as string

const { getProduct } = useProducts()
const { requests, loading: requestsLoading, fetchRequests } = useFeatureRequests()

const product = ref<ProductWithStats | null>(null)
const productLoading = ref(true)

const statusFilter = ref('')
const categoryFilter = ref('')

const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] })),
]

const categoryOptions = [
  { value: '', label: 'All Categories' },
  ...CATEGORIES.map(c => ({ value: c, label: CATEGORY_LABELS[c] })),
]

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
  </div>
</template>
