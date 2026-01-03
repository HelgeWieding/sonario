export default defineNuxtRouteMiddleware(async (to) => {
  const slug = to.params.slug as string
  if (!slug) return

  const { product, errorStatus, fetchProductBySlug } = useProduct()

  // Always fetch by slug to ensure correct product for URL
  await fetchProductBySlug(slug)

  // Redirect to sign-in if not authenticated
  if (errorStatus.value === 401) {
    return navigateTo('/sign-in')
  }

  // Redirect to dashboard if product not found (invalid slug)
  if (!product.value) {
    return navigateTo('/dashboard')
  }
})
