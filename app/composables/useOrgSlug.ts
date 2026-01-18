/**
 * Composable for managing organization slug from URL params
 * Provides utilities for building org-prefixed routes and navigating within org context
 */
export function useOrgSlug() {
  const route = useRoute()
  const router = useRouter()
  const { orgData } = useOrganizationManagement()

  // Get orgSlug from URL params
  const orgSlug = computed(() => route.params.orgSlug as string | undefined)

  // Get the current org from orgData (for when orgSlug might not be in URL)
  const currentOrgSlug = computed(() => orgData.value?.organization?.slug)

  // The effective org slug (from URL or from current org context)
  const effectiveOrgSlug = computed(() => orgSlug.value || currentOrgSlug.value)

  /**
   * Build an org-prefixed route path
   * @param path - The path without org prefix (e.g., '/dashboard', '/settings')
   * @returns Full path with org slug prefix
   */
  function buildOrgRoute(path: string): string {
    const slug = effectiveOrgSlug.value
    if (!slug) {
      console.warn('No org slug available for building route')
      return path
    }
    // Remove leading slash from path if present, then add org prefix
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `/${slug}/${cleanPath}`
  }

  /**
   * Build a product route within the current org context
   * @param productSlug - The product slug
   * @param path - Optional path after product slug (e.g., 'feature-requests')
   * @returns Full path with org and product slug
   */
  function buildProductRoute(productSlug: string, path?: string): string {
    const slug = effectiveOrgSlug.value
    if (!slug) {
      console.warn('No org slug available for building product route')
      return path ? `/${productSlug}/${path}` : `/${productSlug}`
    }
    return path ? `/${slug}/${productSlug}/${path}` : `/${slug}/${productSlug}`
  }

  /**
   * Navigate to a path within the current org context
   * @param path - The path without org prefix
   */
  async function navigateToOrg(path: string) {
    const fullPath = buildOrgRoute(path)
    await router.push(fullPath)
  }

  /**
   * Navigate to a product page within the current org context
   * @param productSlug - The product slug
   * @param path - Optional path after product slug
   */
  async function navigateToProduct(productSlug: string, path?: string) {
    const fullPath = buildProductRoute(productSlug, path)
    await router.push(fullPath)
  }

  /**
   * Check if the user has access to the organization in the URL
   * This validates that the URL's orgSlug matches a membership the user has
   */
  function validateOrgAccess(): boolean {
    const urlOrgSlug = orgSlug.value
    if (!urlOrgSlug) return true // No org in URL, nothing to validate

    const memberships = orgData.value?.memberships ?? []
    return memberships.some(m => m.slug === urlOrgSlug)
  }

  /**
   * Get the organization matching the URL's orgSlug
   */
  const urlOrganization = computed(() => {
    const urlOrgSlug = orgSlug.value
    if (!urlOrgSlug) return null

    const memberships = orgData.value?.memberships ?? []
    return memberships.find(m => m.slug === urlOrgSlug) ?? null
  })

  return {
    // State
    orgSlug,
    currentOrgSlug,
    effectiveOrgSlug,
    urlOrganization,

    // Route builders
    buildOrgRoute,
    buildProductRoute,

    // Navigation
    navigateToOrg,
    navigateToProduct,

    // Validation
    validateOrgAccess,
  }
}
