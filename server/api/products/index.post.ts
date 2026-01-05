import { z } from 'zod'
import { clerkClient } from '@clerk/nuxt/server'
import { getOrCreateUser } from '../../utils/auth'
import { getAuthContext } from '../../utils/organization'
import { productRepository } from '../../repositories/product.repository'
import { organizationRepository } from '../../repositories/organization.repository'
import { generateUniqueSlug } from '../../utils/slug'
import { badRequest } from '../../utils/errors'

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  organizationId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const auth = getAuthContext(event)
  const body = await readBody(event)

  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) {
    badRequest('Invalid product data')
  }

  const { name, description, organizationId } = parsed.data!

  // If creating for an organization, validate access
  if (organizationId) {
    // User must be in the organization to create a product for it
    if (auth.orgId !== organizationId) {
      badRequest('Cannot create product for organization you are not active in')
    }

    // Ensure the organization exists locally
    const client = clerkClient(event)
    const clerkOrg = await client.organizations.getOrganization({ organizationId })

    await organizationRepository.upsert({
      clerkId: organizationId,
      name: clerkOrg.name,
      slug: clerkOrg.slug ?? null,
      imageUrl: clerkOrg.imageUrl ?? null,
    })
  }

  // Generate unique slug (context-aware)
  const slug = await generateUniqueSlug(name, user.id, organizationId)

  // Create the product
  const product = await productRepository.create({
    userId: user.id,
    organizationId: organizationId || null,
    name,
    slug,
    description: description || null,
  })

  // If this is an org product, mark the org as onboarded
  if (organizationId) {
    await organizationRepository.markOnboarded(organizationId)
  }

  return { data: product }
})
