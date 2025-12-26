<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

// This page is just a fallback - the actual callback handling is done server-side
// and redirects to /settings/gmail
onMounted(() => {
  navigateTo('/settings/gmail')
})
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <UiSpinner size="lg" />
  </div>
</template>
