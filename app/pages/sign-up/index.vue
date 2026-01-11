<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
// Invited users (with ticket) go to dashboard, new users go to onboarding
const redirectUrl = computed(() =>
  route.query.__clerk_ticket ? '/dashboard' : '/onboarding'
)
</script>

<template>
  <div>
    <SignUp :fallback-redirect-url="redirectUrl" sign-in-url="/sign-in" />
  </div>
</template>
