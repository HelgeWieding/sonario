export default defineNuxtRouteMiddleware(async (to) => {
  const { products, errorStatus, fetchProducts } = useProducts();
  const { orgId } = useAuth();

  // Skip redirect if already on an onboarding page
  if (to.path.startsWith("/onboarding")) {
    return;
  }

  // If no organization, redirect to create organization
  if (!orgId.value) {
    return navigateTo("/onboarding/create-organization");
  }

  await fetchProducts();

  // Redirect to sign-in if not authenticated
  if (errorStatus.value === 401) {
    return navigateTo("/sign-in");
  }

  // No products in current context - redirect to create product
  if (products.value.length === 0) {
    return navigateTo("/onboarding/create-product");
  }
});
