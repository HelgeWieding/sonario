<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <div>
    <SignUp fallback-redirect-url="/dashboard" sign-in-url="/sign-in" />
  </div>
</template>
