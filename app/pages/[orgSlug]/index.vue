<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const orgSlug = computed(() => route.params.orgSlug as string)

// Redirect to dashboard within org context
navigateTo(`/${orgSlug.value}/dashboard`, { replace: true })
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <UiSpinner size="lg" />
  </div>
</template>
