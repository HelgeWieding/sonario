export default defineNuxtRouteMiddleware(async (to) => {
  const { products, selectedProduct, errorStatus, fetchProducts, selectProductBySlug } = useProducts();
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

  // Sync selectedProduct with route slug
  const routeSlug = to.params.slug as string | undefined;
  if (routeSlug && selectedProduct.value?.slug !== routeSlug) {
    selectProductBySlug(routeSlug);
  }
});
