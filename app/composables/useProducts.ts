import type { ProductWithStats } from '~~/shared/types'

export function useProducts() {
  const { orgId } = useAuth()
  const products = useState<ProductWithStats[]>('products-list', () => [])
  const selectedProduct = useState<ProductWithStats | null>('selected-product', () => null)
  const error = useState<string | null>('products-error', () => null)
  const errorStatus = useState<number | null>('products-error-status', () => null)
  const isLoading = useState<boolean>('products-loading', () => false)
  // Track the org context for the current products
  const productsOrgContext = useState<string | null>('products-org-context', () => null)

  // Get headers for SSR requests (forwards auth cookies)
  function getRequestHeaders() {
    if (import.meta.server) {
      return useRequestHeaders(['cookie'])
    }
    return {}
  }

  // Fetch all products for the current context (personal or org)
  async function fetchProducts() {
    isLoading.value = true
    const headers = getRequestHeaders()
    const currentOrgId = orgId.value || null

    // If org context changed, clear the current selection immediately
    if (productsOrgContext.value !== currentOrgId) {
      selectedProduct.value = null
      products.value = []
    }

    try {
      // Use $fetch directly to always get fresh data (no caching issues on org switch)
      const response = await $fetch<{ data: ProductWithStats[] }>('/api/products/list', { headers })
      products.value = response.data
      error.value = null
      errorStatus.value = null
      productsOrgContext.value = currentOrgId

      // Clear selection if current product no longer exists in list
      if (selectedProduct.value) {
        const currentStillExists = products.value.some(p => p.id === selectedProduct.value?.id)
        if (!currentStillExists) {
          selectedProduct.value = null
        }
      }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch products'
      errorStatus.value = e.statusCode || null
      products.value = []
      selectedProduct.value = null
    }

    isLoading.value = false
  }

  // Refresh products list (force re-fetch)
  async function refreshProducts() {
    const headers = getRequestHeaders()
    const currentOrgId = orgId.value || null

    try {
      const response = await $fetch<{ data: ProductWithStats[] }>('/api/products/list', { headers })
      products.value = response.data
      error.value = null
      errorStatus.value = null
      productsOrgContext.value = currentOrgId

      // Update selected product if it's in the list
      if (selectedProduct.value) {
        const updated = products.value.find(p => p.id === selectedProduct.value?.id)
        if (updated) {
          selectedProduct.value = updated
        } else {
          selectedProduct.value = null
        }
      }
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch products'
      errorStatus.value = e.statusCode || null
    }
  }

  // Select a specific product
  function selectProduct(product: ProductWithStats) {
    selectedProduct.value = product
  }

  // Select a product by ID
  function selectProductById(productId: string) {
    const found = products.value.find(p => p.id === productId)
    if (found) {
      selectedProduct.value = found
    }
  }

  // Select a product by slug
  function selectProductBySlug(slug: string) {
    const found = products.value.find(p => p.slug === slug)
    if (found) {
      selectedProduct.value = found
    }
  }

  // Deselect the current product
  function deselectProduct() {
    selectedProduct.value = null
  }

  // Check if there are any products
  const hasProducts = computed(() => products.value.length > 0)

  // Check if there are multiple products
  const hasMultipleProducts = computed(() => products.value.length > 1)

  return {
    products,
    selectedProduct,
    error,
    errorStatus,
    isLoading,
    hasProducts,
    hasMultipleProducts,
    fetchProducts,
    refreshProducts,
    selectProduct,
    selectProductById,
    selectProductBySlug,
    deselectProduct,
  }
}
