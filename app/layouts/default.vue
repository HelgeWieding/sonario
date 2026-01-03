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
  <LayoutAppHeader />
  <div class="min-h-screen w-full bg-gray-50">
    <div class="flex flex-1">
      <LayoutAppSidebar />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
