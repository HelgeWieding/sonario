import type {
  Product,
  ProductWithStats,
  UpdateProductInput,
} from "~~/shared/types";
import type { Ref, ComputedRef } from "vue";

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

  // Fetch product by URL slug (for [slug]/* routes)
  // Accepts a ref/computed to re-fetch when slug changes
  async function fetchProductServer(slug: Ref<string> | ComputedRef<string>) {
    const headers = getRequestHeaders();

    const { data, error: fetchError } = await useAsyncData(
      `product-${slug.value}`,
      async () => {
        const result = await $fetch<{ data: ProductWithStats }>(
          `/api/products/${slug.value}`,
          { headers }
        );
        return result.data;
      },
      {
        watch: [slug],
      }
    );

    // Sync to shared product state
    watch(
      data,
      (newData) => {
        if (newData) {
          product.value = newData;
        }
      },
      { immediate: true }
    );

    // Sync errors
    watch(
      fetchError,
      (err) => {
        if (err) {
          error.value = err.message || "Failed to fetch product";
          errorStatus.value = (err as any).statusCode || null;
        } else {
          error.value = null;
          errorStatus.value = null;
        }
      },
      { immediate: true }
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
    fetchProductServer,
    createProduct,
    updateProduct,
  };
}
