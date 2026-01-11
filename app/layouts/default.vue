<script setup lang="ts">
const route = useRoute()
const { isSignedIn } = useAuth()
const { fetchOrganizationData } = useOrganizationManagement()
const { selectedProduct, selectProductBySlug, fetchProductsWithRedirect } = useProducts()

// Fetch organization data server-side
await fetchOrganizationData()

// Fetch products (redirect to create-product if empty)
await fetchProductsWithRedirect()

// Redirect to sign-in if not authenticated
watch(isSignedIn, (signedIn) => {
  if (!signedIn) {
    navigateTo('/sign-in')
  }
}, { immediate: true })

// Sync selectedProduct with route slug
watch(
  () => route.params.slug,
  (newSlug) => {
    if (typeof newSlug === 'string' && newSlug) {
      if (selectedProduct.value?.slug !== newSlug) {
        selectProductBySlug(newSlug)
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <LayoutAppHeader />
  <div class="min-h-screen w-full bg-gray-50">
    <div class="flex flex-1">
      <LayoutAppSidebar />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
