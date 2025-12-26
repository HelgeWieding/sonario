<script setup lang="ts">
interface Props {
  title: string
  value: number | string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <UiCard>
    <p class="text-sm font-medium text-gray-500">{{ title }}</p>
    <p class="mt-1 text-3xl font-bold text-gray-900">{{ value }}</p>
    <p v-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
  </UiCard>
</template>
