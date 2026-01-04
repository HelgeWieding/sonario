import { clerkClient } from '@clerk/nuxt/server'
import { getOrCreateUser } from '../../utils/auth'
import { getAuthContext } from '../../utils/organization'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const auth = getAuthContext(event)

  // If no active organization, return null
  if (!auth.orgId) {
    return {
      data: {
        organization: null,
        role: null,
        memberships: [],
      },
    }
  }

  try {
    const client = clerkClient(event)

    // Get the active organization details
    const organization = await client.organizations.getOrganization({
      organizationId: auth.orgId,
    })

    // Get user's memberships to list available orgs
    const { data: memberships } = await client.users.getOrganizationMembershipList({
      userId: auth.userId,
      limit: 20,
    })

    return {
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          imageUrl: organization.imageUrl,
        },
        role: auth.orgRole,
        memberships: memberships.map(m => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          imageUrl: m.organization.imageUrl,
          role: m.role,
        })),
      },
    }
  } catch (error: any) {
    // If organizations aren't enabled or there's an error, return empty
    console.error('Failed to fetch organization:', error.message)
    return {
      data: {
        organization: null,
        role: null,
        memberships: [],
      },
    }
  }
})
