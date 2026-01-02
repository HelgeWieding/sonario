import { eq, and, ne } from 'drizzle-orm'
import { getDb, schema } from '../db'

const RESERVED_SLUGS = ['dashboard', 'settings', 'sign-in', 'sign-up', 'auth', 'api']

/**
 * Generates a URL-safe slug from a product name.
 */
export function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)

  if (!slug || RESERVED_SLUGS.includes(slug)) {
    return 'product'
  }

  return slug
}

/**
 * Generates a unique slug for a user.
 * Appends a numeric suffix if the base slug already exists.
 */
export async function generateUniqueSlug(
  name: string,
  userId: string,
  excludeProductId?: string
): Promise<string> {
  const db = getDb()
  const baseSlug = generateSlug(name)

  let slug = baseSlug
  let suffix = 2

  while (true) {
    const conditions = [
      eq(schema.products.slug, slug),
      eq(schema.products.userId, userId),
    ]

    if (excludeProductId) {
      conditions.push(ne(schema.products.id, excludeProductId))
    }

    const existing = await db.query.products.findFirst({
      where: and(...conditions),
      columns: { id: true },
    })

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${suffix}`
    suffix++

    if (suffix > 100) {
      return `${baseSlug}-${Date.now()}`
    }
  }
}
