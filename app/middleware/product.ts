export default defineNuxtRouteMiddleware(async (to) => {
  const { products, errorStatus, fetchProducts } = useProducts()
  const { orgId } = useAuth()

  await fetchProducts()

  // Redirect to sign-in if not authenticated
  if (errorStatus.value === 401) {
    return navigateTo('/sign-in')
  }

  // Skip redirect if already on an onboarding page
  if (to.path.startsWith('/onboarding')) {
    return
  }

  // No products in current context - redirect to appropriate onboarding
  if (products.value.length === 0) {
    if (orgId.value) {
      // Organization context but no org products
      return navigateTo(`/onboarding/organization?orgId=${orgId.value}`)
    } else {
      // Personal context but no personal products
      return navigateTo('/onboarding')
    }
  }
})
