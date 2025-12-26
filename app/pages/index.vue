<script setup lang="ts">
const { isSignedIn } = useAuth()

// Redirect based on auth status
watchEffect(() => {
  if (isSignedIn.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/sign-in')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <UiSpinner size="lg" />
  </div>
</template>
