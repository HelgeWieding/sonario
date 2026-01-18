<script setup lang="ts">
definePageMeta({
  layout: "auth",
});
</script>

<template>
  <div>
    <SignIn
      fallback-redirect-url="/post-auth-redirect"
      sign-up-url="/sign-up"
      redirect-url="/post-auth-redirect"
    />
  </div>
</template>
