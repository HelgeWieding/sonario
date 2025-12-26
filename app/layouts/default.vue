<script setup lang="ts">
const { isSignedIn } = useAuth()

// Redirect to sign-in if not authenticated
watch(isSignedIn, (signedIn) => {
  if (!signedIn) {
    navigateTo('/sign-in')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutAppHeader />
    <div class="flex">
      <LayoutAppSidebar />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
