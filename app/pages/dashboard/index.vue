<script setup lang="ts">
import type { DashboardStats } from '~~/shared/types'

definePageMeta({
  middleware: ['auth'],
})

// Use the products composable for multi-product support
const { products, selectedProduct, hasMultipleProducts, selectProduct } = useProducts()

const statsLoading = ref(true)
const stats = ref<DashboardStats | null>(null)

async function fetchStats() {
  try {
    const { data } = await $fetch<{ data: DashboardStats }>('/api/stats/dashboard')
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

      <!-- Product Selector (shown when multiple products exist) -->
      <div v-if="hasMultipleProducts" class="flex items-center gap-2">
        <span class="text-sm text-gray-500">Product:</span>
        <ProductSelector
          :products="products"
          :selected="selectedProduct"
          @select="selectProduct"
        />
      </div>
    </div>

    <!-- Stats -->
    <div v-if="statsLoading" class="grid gap-4 md:grid-cols-3 mb-8">
      <UiCard v-for="i in 3" :key="i">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div class="h-8 bg-gray-200 rounded w-16" />
        </div>
      </UiCard>
    </div>
    <div v-else-if="stats" class="grid gap-4 md:grid-cols-3 mb-8">
      <DashboardStatsCard
        title="Feature Requests"
        :value="stats.totalFeatureRequests"
      />
      <DashboardStatsCard
        title="New This Week"
        :value="stats.newRequestsThisWeek"
      />
      <DashboardStatsCard
        title="Gmail Status"
        :value="stats.gmailConnected ? 'Connected' : 'Not Connected'"
      />
    </div>

    <!-- Quick Actions -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-if="selectedProduct" :to="`/${selectedProduct.slug}/feature-requests`">
          <UiCard class="hover:border-primary-300 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
                </svg>
              </div>
              <div>
                <div class="font-medium text-gray-900">View Feature Requests</div>
                <div class="text-sm text-gray-500">{{ selectedProduct?.featureRequestCount || 0 }} total requests</div>
              </div>
            </div>
          </UiCard>
        </NuxtLink>

        <NuxtLink v-if="selectedProduct" :to="`/${selectedProduct.slug}/settings/gmail`">
          <UiCard class="hover:border-primary-300 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-green-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <div class="font-medium text-gray-900">Gmail Integration</div>
                <div class="text-sm text-gray-500">{{ stats?.gmailConnected ? 'Connected' : 'Set up email processing' }}</div>
              </div>
            </div>
          </UiCard>
        </NuxtLink>

        <NuxtLink v-if="selectedProduct" :to="`/${selectedProduct.slug}/settings`">
          <UiCard class="hover:border-primary-300 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-purple-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <div>
                <div class="font-medium text-gray-900">Product Settings</div>
                <div class="text-sm text-gray-500">Configure your product</div>
              </div>
            </div>
          </UiCard>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
