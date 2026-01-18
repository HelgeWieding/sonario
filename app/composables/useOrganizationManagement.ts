interface OrganizationInfo {
  id: string
  name: string
  slug: string
  imageUrl: string | null
}

interface OrganizationMembership extends OrganizationInfo {
  role: string
}

interface OrganizationData {
  organization: OrganizationInfo | null
  role: string | null
  memberships: OrganizationMembership[]
}

export function useOrganizationManagement() {
  const orgData = useState<OrganizationData | null>('organization-data', () => null)
  const error = useState<string | null>('organization-error', () => null)

  // Get headers for SSR requests (forwards auth cookies)
  function getRequestHeaders() {
    if (import.meta.server) {
      return useRequestHeaders(['cookie'])
    }
    return {}
  }

  // Fetch organization data server-side
  async function fetchOrganizationData() {
    const headers = getRequestHeaders()

    try {
      const response = await $fetch<{ data: OrganizationData }>('/api/organizations/current', { headers })
      orgData.value = response.data
      error.value = null
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch organization data'
      orgData.value = null
    }
  }

  // Computed properties for easy access
  const isOrgContext = computed(() => !!orgData.value?.organization)
  const currentOrg = computed(() => orgData.value?.organization)
  const currentOrgName = computed(() => orgData.value?.organization?.name)
  const currentOrgId = computed(() => orgData.value?.organization?.id)
  const isOrgAdmin = computed(() => orgData.value?.role === 'org:admin')
  const memberships = computed(() => orgData.value?.memberships ?? [])
  const hasMemberships = computed(() => memberships.value.length > 0)

  return {
    orgData,
    error,
    fetchOrganizationData,
    isOrgContext,
    currentOrg,
    currentOrgName,
    currentOrgId,
    isOrgAdmin,
    memberships,
    hasMemberships,
  }
}
