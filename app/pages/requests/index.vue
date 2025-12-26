<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { products, fetchProducts } = useProducts()
const router = useRouter()

onMounted(async () => {
  await fetchProducts()

  if (products.value.length > 0) {
    // Redirect to the user's product
    router.replace(`/products/${products.value[0].id}`)
  } else {
    // No product found - this shouldn't happen with auto-creation
    // but fallback to dashboard
    router.replace('/dashboard')
  }
})
</script>

<template>
  <div class="flex justify-center py-12">
    <UiSpinner size="lg" />
  </div>
</template>
