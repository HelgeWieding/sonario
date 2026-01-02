<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { products, fetchProducts } = useProducts()
const router = useRouter()

onMounted(async () => {
  await fetchProducts()

  if (products.value.length > 0) {
    // Redirect to the user's product feature requests
    router.replace(`/${products.value[0].slug}/feature-requests`)
  } else {
    // No product found - fallback to dashboard
    router.replace('/dashboard')
  }
})
</script>

<template>
  <div class="flex justify-center py-12">
    <UiSpinner size="lg" />
  </div>
</template>
