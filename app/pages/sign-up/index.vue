<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
// Invited users (with ticket) go to post-auth-redirect, new users go to onboarding
const redirectUrl = computed(() =>
  route.query.__clerk_ticket ? '/post-auth-redirect' : '/onboarding/create-organization'
)
</script>

<template>
  <div>
    <SignUp :fallback-redirect-url="redirectUrl" sign-in-url="/sign-in" />
  </div>
</template>
