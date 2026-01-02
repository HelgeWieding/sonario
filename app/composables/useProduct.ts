import type { Product, ProductWithStats, UpdateProductInput } from '~~/shared/types'

export function useProduct() {
  const product = useState<ProductWithStats | null>('product', () => null)
  const loading = useState('product-loading', () => false)
  const error = useState<string | null>('product-error', () => null)

  async function fetchProduct() {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: ProductWithStats }>('/api/products')
      product.value = data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch product'
      product.value = null
    } finally {
      loading.value = false
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
    loading,
    error,
    fetchProduct,
    updateProduct,
  }
}
