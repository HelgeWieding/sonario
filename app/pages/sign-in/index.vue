<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <div>
    <SignIn fallback-redirect-url="/dashboard" sign-up-url="/sign-up" />
  </div>
</template>
