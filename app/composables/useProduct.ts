import type { Product, ProductWithStats, UpdateProductInput } from '~~/shared/types'

export function useProduct() {
  const product = useState<ProductWithStats | null>('product', () => null)
  const error = useState<string | null>('product-error', () => null)
  const errorStatus = useState<number | null>('product-error-status', () => null)

  // Get headers for SSR requests (forwards auth cookies)
  function getRequestHeaders() {
    if (import.meta.server) {
      return useRequestHeaders(['cookie'])
    }
    return {}
  }

  // Fetch user's first product (for dashboard/settings/onboarding)
  async function fetchFirstProduct() {
    const headers = getRequestHeaders()

    const { data, error: fetchError } = await useAsyncData(
      'first-product',
      () => $fetch<{ data: ProductWithStats }>('/api/products', { headers })
    )

    if (fetchError.value) {
      error.value = fetchError.value.data?.message || 'Failed to fetch product'
      errorStatus.value = fetchError.value.statusCode || null
      product.value = null
    } else if (data.value) {
      product.value = data.value.data
      error.value = null
      errorStatus.value = null
    }
  }

  // Fetch product by URL slug (for [slug]/* routes)
  async function fetchProductBySlug(slug: string) {
    const headers = getRequestHeaders()

    const { data, error: fetchError } = await useAsyncData(
      `product-${slug}`,
      () => $fetch<{ data: ProductWithStats }>(`/api/products/${slug}`, { headers })
    )

    if (fetchError.value) {
      error.value = fetchError.value.data?.message || 'Product not found'
      errorStatus.value = fetchError.value.statusCode || null
      product.value = null
    } else if (data.value) {
      product.value = data.value.data
      error.value = null
      errorStatus.value = null
    }
  }

  async function createProduct(input: { name: string; description?: string }): Promise<Product | null> {
    error.value = null

    try {
      const { data } = await $fetch<{ data: Product }>('/api/products', {
        method: 'POST',
        body: input,
      })
      product.value = data as ProductWithStats
      return data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to create product'
      return null
    }
  }

  async function updateProduct(input: UpdateProductInput): Promise<Product | null> {
    try {
      const { data } = await $fetch<{ data: Product }>('/api/products', {
        method: 'PUT',
        body: input,
      })
      // Update local state with new data while preserving stats
      if (product.value) {
        product.value = {
          ...product.value,
          ...data,
        }
      }
      return data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to update product'
      return null
    }
  }

  return {
    product,
    error,
    errorStatus,
    fetchFirstProduct,
    fetchProductBySlug,
    createProduct,
    updateProduct,
  }
}
