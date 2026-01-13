<script setup lang="ts">
interface Props {
  padding?: boolean
  variant?: 'default' | 'elevated'
}

withDefaults(defineProps<Props>(), {
  padding: true,
  variant: 'default',
})
</script>

<template>
  <div
    :class="[
      'rounded-xl border transition-colors',
      variant === 'elevated'
        ? 'bg-white border-neutral-100 shadow-soft'
        : 'bg-white border-neutral-200',
      padding && 'p-6',
    ]"
  >
    <slot />
  </div>
</template>
