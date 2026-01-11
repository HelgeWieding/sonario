<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

const { selectedProduct, fetchProducts } = useProducts()

// This page is just a fallback - the actual callback handling is done server-side
// and redirects to /{slug}/settings/gmail
onMounted(async () => {
  await fetchProducts()
  if (selectedProduct.value) {
    navigateTo(`/${selectedProduct.value.slug}/settings/gmail`)
  } else {
    navigateTo('/dashboard')
  }
})
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <UiSpinner size="lg" />
  </div>
</template>
