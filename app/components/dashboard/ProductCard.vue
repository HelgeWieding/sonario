<script setup lang="ts">
import type { ProductWithStats } from '~~/shared/types'

interface Props {
  product: ProductWithStats
}

defineProps<Props>()
</script>

<template>
  <NuxtLink :to="`/products/${product.id}`" class="block">
    <UiCard class="hover:border-primary-300 transition-colors cursor-pointer">
      <h3 class="font-semibold text-gray-900">{{ product.name }}</h3>
      <p v-if="product.description" class="text-sm text-gray-500 mt-1 line-clamp-2">
        {{ product.description }}
      </p>
      <div class="mt-4 flex items-center gap-4 text-sm">
        <div>
          <span class="font-medium text-gray-900">{{ product.featureRequestCount }}</span>
          <span class="text-gray-500"> requests</span>
        </div>
        <div v-if="product.newRequestCount > 0">
          <UiBadge variant="info">{{ product.newRequestCount }} new</UiBadge>
        </div>
      </div>
    </UiCard>
  </NuxtLink>
</template>
