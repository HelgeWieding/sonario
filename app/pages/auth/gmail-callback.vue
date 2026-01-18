<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

const { selectedProduct, fetchProducts } = useProducts()
const { buildProductRoute } = useOrgSlug()

// This page is just a fallback - the actual callback handling is done server-side
// and redirects to /{orgSlug}/{slug}/settings/gmail
onMounted(async () => {
  await fetchProducts()
  if (selectedProduct.value) {
    navigateTo(buildProductRoute(selectedProduct.value.slug, 'settings/gmail'))
  } else {
    navigateTo('/post-auth-redirect')
  }
})
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <UiSpinner size="lg" />
  </div>
</template>
