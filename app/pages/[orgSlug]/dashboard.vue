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
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 tracking-tight">Dashboard</h1>
        <p class="mt-1 text-sm text-neutral-500">Overview of your feature requests and activity</p>
      </div>

      <!-- Product Selector (shown when multiple products exist) -->
      <div v-if="hasMultipleProducts" class="flex items-center gap-3">
        <span class="text-sm text-neutral-500">Product:</span>
        <ProductSelector
          :products="products"
          :selected="selectedProduct"
          @select="selectProduct"
        />
      </div>
    </div>

    <!-- Stats Grid -->
    <div v-if="statsLoading" class="grid gap-6 md:grid-cols-2">
      <UiCard v-for="i in 2" :key="i">
        <div class="space-y-3">
          <div class="h-4 bg-neutral-100 rounded w-24 animate-pulse" />
          <div class="h-8 bg-neutral-100 rounded w-16 animate-pulse" />
        </div>
      </UiCard>
    </div>
    <div v-else-if="stats" class="grid gap-6 md:grid-cols-2">
      <DashboardStatsCard
        title="Feature Requests"
        :value="stats.totalFeatureRequests"
      />
      <DashboardStatsCard
        title="New This Week"
        :value="stats.newRequestsThisWeek"
      />
    </div>
  </div>
</template>
