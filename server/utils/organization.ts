import type { H3Event } from 'h3'
import { clerkClient } from '@clerk/nuxt/server'
import { eq, inArray } from 'drizzle-orm'
import { getDb, schema } from '../db'

export interface AuthContext {
  userId: string
  orgId: string | null
  orgRole: string | null
}

/**
 * Get extended auth context including organization info
 */
export function getAuthContext(event: H3Event): AuthContext {
  const auth = event.context.auth()

  return {
    userId: auth.userId!,
    orgId: auth.orgId || null,
    orgRole: auth.orgRole || null,
  }
}

/**
 * Get all Clerk user IDs that belong to an organization
 */
export async function getOrganizationMemberClerkIds(
  event: H3Event,
  orgId: string,
): Promise<string[]> {
  const client = clerkClient(event)

  const { data: memberships } = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    limit: 100,
  })

  return memberships
    .map(m => m.publicUserData?.userId)
    .filter((id): id is string => !!id)
}

/**
 * Get database user IDs for all members of an organization
 */
export async function getOrganizationMemberUserIds(
  event: H3Event,
  orgId: string,
): Promise<string[]> {
  const db = getDb()
  const clerkIds = await getOrganizationMemberClerkIds(event, orgId)

  if (clerkIds.length === 0) return []

  const users = await db.query.users.findMany({
    where: inArray(schema.users.clerkId, clerkIds),
    columns: { id: true },
  })

  return users.map(u => u.id)
}

/**
 * Check if user has access to a product
 * Access is granted if:
 * 1. User owns the product directly, OR
 * 2. Product has organizationId matching user's active org, OR
 * 3. Product owner is a member of user's active organization
 */
export async function hasProductAccess(
  event: H3Event,
  productId: string,
  userId: string,
): Promise<boolean> {
  const db = getDb()
  const auth = getAuthContext(event)

  const product = await db.query.products.findFirst({
    where: eq(schema.products.id, productId),
  })

  if (!product) return false

  // Direct owner always has access
  if (product.userId === userId) return true

  // If user has active org, check org-based access
  if (auth.orgId) {
    // Product is explicitly assigned to this org
    if (product.organizationId === auth.orgId) {
      return true
    }

    // Product owner is member of same org (shared access)
    const memberUserIds = await getOrganizationMemberUserIds(event, auth.orgId)
    if (memberUserIds.includes(product.userId)) {
      return true
    }
  }

  return false
}

/**
 * Get all product IDs accessible to the user
 * Includes: owned products + org-shared products
 */
export async function getAccessibleProductIds(
  event: H3Event,
  userId: string,
): Promise<string[]> {
  const db = getDb()
  const auth = getAuthContext(event)

  // Get user's own products
  const ownProducts = await db.query.products.findMany({
    where: eq(schema.products.userId, userId),
    columns: { id: true },
  })

  const productIds = new Set(ownProducts.map(p => p.id))

  // If user has active org, include org-accessible products
  if (auth.orgId) {
    // Products explicitly assigned to org
    const orgProducts = await db.query.products.findMany({
      where: eq(schema.products.organizationId, auth.orgId),
      columns: { id: true },
    })
    orgProducts.forEach(p => productIds.add(p.id))

    // Products owned by other org members
    const memberUserIds = await getOrganizationMemberUserIds(event, auth.orgId)
    if (memberUserIds.length > 0) {
      const memberProducts = await db.query.products.findMany({
        where: inArray(schema.products.userId, memberUserIds),
        columns: { id: true },
      })
      memberProducts.forEach(p => productIds.add(p.id))
    }
  }

  return [...productIds]
}
