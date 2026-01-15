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
      'rounded-xl transition-all duration-200',
      variant === 'elevated'
        ? 'bg-white shadow-card-hover'
        : 'bg-white shadow-card hover:shadow-card-hover',
      padding && 'p-6',
    ]"
  >
    <slot />
  </div>
</template>
