<script setup lang="ts">
import type { DashboardStats } from "~~/shared/types";

definePageMeta({
  middleware: ["auth"],
});

// Use the products composable for multi-product support
const { products, selectedProduct, hasMultipleProducts, selectProduct } =
  useProducts();

const statsLoading = ref(true);
const stats = ref<DashboardStats | null>(null);

async function fetchStats() {
  try {
    const { data } = await $fetch<{ data: DashboardStats }>(
      "/api/stats/dashboard"
    );
    stats.value = data;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  } finally {
    statsLoading.value = false;
  }
}

onMounted(() => {
  fetchStats();
});
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
  </div>
</template>
