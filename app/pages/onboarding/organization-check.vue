<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

const { orgId } = useAuth()

// Check if org has products and redirect accordingly
const { data, error } = await useFetch<{ hasProducts: boolean }>(
  () => `/api/organizations/${orgId.value}/has-products`,
  {
    server: false,
  },
)

// Wait for data and redirect
watchEffect(() => {
  if (error.value) {
    // If there's an error (e.g., no org context), go to dashboard
    navigateTo('/dashboard')
    return
  }

  if (data.value !== undefined) {
    if (data.value.hasProducts) {
      // Org already has products, go to dashboard
      navigateTo('/dashboard')
    } else {
      // Org needs a product, redirect to org onboarding
      navigateTo(`/onboarding/organization?orgId=${orgId.value}`)
    }
  }
})
</script>

<template>
  <div class="bg-white rounded-lg shadow p-8">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
      <p class="mt-4 text-sm text-gray-600">Setting up your organization...</p>
    </div>
  </div>
</template>
