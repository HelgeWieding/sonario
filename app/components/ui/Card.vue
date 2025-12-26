<script setup lang="ts">
interface Props {
  padding?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: true,
})
</script>

<template>
  <div :class="['bg-white rounded-lg border border-gray-200 shadow-sm', padding && 'p-6']">
    <slot />
  </div>
</template>
