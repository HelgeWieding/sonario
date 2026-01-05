import type { H3Event } from 'h3'
import { clerkClient } from '@clerk/nuxt/server'
import { eq, inArray, isNull, and } from 'drizzle-orm'
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
 * Check if user has access to a product in the CURRENT context.
 * - In org context: product must belong to the active organization
 * - In personal context: product must be personal (no org) and owned by user
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

  if (auth.orgId) {
    // Org context: product must belong to this organization
    return product.organizationId === auth.orgId
  } else {
    // Personal context: product must be personal (no org) and owned by user
    return product.organizationId === null && product.userId === userId
  }
}

/**
 * Check if user has access to a product (regardless of context).
 * Used for operations that should work across contexts (e.g., product owner actions).
 */
export async function hasProductOwnership(
  event: H3Event,
  productId: string,
  userId: string,
): Promise<boolean> {
  const db = getDb()

  const product = await db.query.products.findFirst({
    where: eq(schema.products.id, productId),
  })

  if (!product) return false

  // Only direct owner has ownership
  return product.userId === userId
}

/**
 * Get product IDs for the CURRENT context only.
 * - In org context: returns products belonging to the active organization
 * - In personal context: returns user's personal products (no org)
 */
export async function getContextProductIds(
  event: H3Event,
  userId: string,
): Promise<string[]> {
  const db = getDb()
  const auth = getAuthContext(event)

  if (auth.orgId) {
    // Org context: only products assigned to this organization
    const orgProducts = await db.query.products.findMany({
      where: eq(schema.products.organizationId, auth.orgId),
      columns: { id: true },
    })
    return orgProducts.map(p => p.id)
  } else {
    // Personal context: only user's personal products (no org)
    const personalProducts = await db.query.products.findMany({
      where: and(
        eq(schema.products.userId, userId),
        isNull(schema.products.organizationId),
      ),
      columns: { id: true },
    })
    return personalProducts.map(p => p.id)
  }
}

/**
 * Get all product IDs accessible to the user (across all contexts).
 * Includes: owned products + org-shared products.
 * Use getContextProductIds for context-aware access.
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
