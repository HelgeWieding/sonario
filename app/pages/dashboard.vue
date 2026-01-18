<script setup lang="ts">
// /dashboard is not a valid route - show 404
definePageMeta({
  layout: false,
})

throw createError({
  statusCode: 404,
  statusMessage: 'Page not found',
  fatal: true,
})
</script>

<template>
  <div />
</template>
