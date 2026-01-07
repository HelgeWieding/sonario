import type {
  Product,
  ProductWithStats,
  UpdateProductInput,
} from "~~/shared/types";

export function useProduct() {
  const product = useState<ProductWithStats | null>("product", () => null);
  const error = useState<string | null>("product-error", () => null);
  const errorStatus = useState<number | null>(
    "product-error-status",
    () => null
  );

  // Get headers for SSR requests (forwards auth cookies)
  function getRequestHeaders() {
    if (import.meta.server) {
      return useRequestHeaders(["cookie"]);
    }
    return {};
  }

  // Fetch user's first product (for dashboard/settings/onboarding)
  async function fetchFirstProduct() {
    const headers = getRequestHeaders();

    try {
      // Use $fetch directly to always get fresh data with current auth context
      const response = await $fetch<{ data: ProductWithStats }>(
        "/api/products",
        { headers }
      );
      product.value = response.data;
      error.value = null;
      errorStatus.value = null;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to fetch product";
      errorStatus.value = e.statusCode || null;
      product.value = null;
    }
  }

  // Fetch product by URL slug (for [slug]/* routes) - runs on server only
  async function fetchProductServer(slug: string) {
    const headers = getRequestHeaders();

    return useAsyncData(`product-${slug}`, () =>
      $fetch<{ data: ProductWithStats }>(`/api/products/${slug}`, {
        headers,
      })
    );
  }

  async function createProduct(input: {
    name: string;
    description?: string;
    organizationId?: string;
  }): Promise<Product | null> {
    error.value = null;

    try {
      const { data } = await $fetch<{ data: Product }>("/api/products", {
        method: "POST",
        body: input,
      });
      product.value = data as ProductWithStats;
      return data;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to create product";
      return null;
    }
  }

  async function updateProduct(
    input: UpdateProductInput
  ): Promise<Product | null> {
    try {
      const { data } = await $fetch<{ data: Product }>("/api/products", {
        method: "PUT",
        body: input,
      });
      // Update local state with new data while preserving stats
      if (product.value) {
        product.value = {
          ...product.value,
          ...data,
        };
      }
      return data;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to update product";
      return null;
    }
  }

  return {
    product,
    error,
    errorStatus,
    fetchFirstProduct,
    fetchProductServer,
    createProduct,
    updateProduct,
  };
}
