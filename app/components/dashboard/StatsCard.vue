<script setup lang="ts">
interface Props {
  title: string
  value: number | string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <UiCard class="group">
    <p class="text-sm font-medium text-neutral-500">{{ title }}</p>
    <p class="mt-2 text-3xl font-semibold text-neutral-900 tracking-tight">{{ value }}</p>
    <p v-if="description" class="mt-1 text-sm text-neutral-500">{{ description }}</p>
  </UiCard>
</template>
