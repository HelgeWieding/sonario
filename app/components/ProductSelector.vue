<script setup lang="ts">
import type { ProductWithStats } from '~~/shared/types'

interface Props {
  products: ProductWithStats[]
  selected: ProductWithStats | null
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStats: false,
})

const emit = defineEmits<{
  select: [product: ProductWithStats]
}>()

const selectedId = computed(() => props.selected?.id || '')

function handleChange(productId: string) {
  const product = props.products.find(p => p.id === productId)
  if (product) {
    emit('select', product)
  }
}
</script>

<template>
  <div class="relative">
    <select
      :value="selectedId"
      class="block w-full px-3 py-2 pr-8 text-sm font-medium border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
      @change="handleChange(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="product in products"
        :key="product.id"
        :value="product.id"
      >
        {{ product.name }}
        <template v-if="showStats">
          ({{ product.featureRequestCount }} requests)
        </template>
      </option>
    </select>
    <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>
