import type { Product, ProductWithStats, CreateProductInput, UpdateProductInput } from '~~/shared/types'

export function useProducts() {
  const products = useState<Product[]>('products', () => [])
  const loading = useState('products-loading', () => false)
  const error = useState<string | null>('products-error', () => null)

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: Product[] }>('/api/products')
      products.value = data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch products'
    } finally {
      loading.value = false
    }
  }

  async function getProduct(id: string): Promise<ProductWithStats | null> {
    try {
      const { data } = await $fetch<{ data: ProductWithStats }>(`/api/products/${id}`)
      return data
    } catch {
      return null
    }
  }

  async function createProduct(input: CreateProductInput): Promise<Product | null> {
    try {
      const { data } = await $fetch<{ data: Product }>('/api/products', {
        method: 'POST',
        body: input,
      })
      products.value = [data, ...products.value]
      return data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to create product'
      return null
    }
  }

  async function updateProduct(id: string, input: UpdateProductInput): Promise<Product | null> {
    try {
      const { data } = await $fetch<{ data: Product }>(`/api/products/${id}`, {
        method: 'PUT',
        body: input,
      })
      products.value = products.value.map(p => p.id === id ? data : p)
      return data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to update product'
      return null
    }
  }

  async function deleteProduct(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/products/${id}`, { method: 'DELETE' })
      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to delete product'
      return false
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}
