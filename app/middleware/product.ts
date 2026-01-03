export default defineNuxtRouteMiddleware(async (to) => {
  const { product, errorStatus, fetchFirstProduct } = useProduct()

  await fetchFirstProduct()

  // Redirect to sign-in if not authenticated
  if (errorStatus.value === 401) {
    return navigateTo('/sign-in')
  }

  // Redirect to onboarding if no product (except on onboarding page itself)
  if (!product.value && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }

  // Redirect to dashboard if user already has a product and is on onboarding
  if (product.value && to.path === '/onboarding') {
    return navigateTo('/dashboard')
  }
})
