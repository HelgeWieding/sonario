<script setup lang="ts">
const route = useRoute()
const { isSignedIn } = useAuth()
const { fetchOrganizationData } = useOrganizationManagement()
const { selectedProduct, selectProductBySlug, fetchProductsWithRedirect } = useProducts()

// Modal container for teleportation
const modalContainer = ref<HTMLElement | null>(null)
provideModalContainer(modalContainer)

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
  <div class="min-h-screen bg-white">
    <LayoutAppHeader />
    <div class="flex">
      <LayoutAppSidebar />
      <main class="flex-1 p-8">
        <div class="max-w-6xl">
          <slot />
        </div>
      </main>
    </div>
    <!-- Modal container for teleportation -->
    <div ref="modalContainer" id="modal-container" />
  </div>
</template>
