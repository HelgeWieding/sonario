import { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '../db'
import { generateSlug } from './slug'

export async function requireAuth(event: H3Event) {
  const auth = event.context.auth()

  if (!auth.userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  return auth
}

export async function getOrCreateUser(event: H3Event) {
  const auth = await requireAuth(event)
  const db = getDb()

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, auth.userId),
  })

  if (existingUser) {
    return existingUser
  }

  // Create new user
  const [newUser] = await db.insert(schema.users).values({
    clerkId: auth.userId,
    email: auth.sessionClaims?.email as string || '',
    firstName: auth.sessionClaims?.first_name as string || null,
    lastName: auth.sessionClaims?.last_name as string || null,
    imageUrl: auth.sessionClaims?.image_url as string || null,
  }).returning()

  // Auto-create a default product for new users
  const productName = 'My Product'
  await db.insert(schema.products).values({
    userId: newUser.id,
    name: productName,
    slug: generateSlug(productName),
    description: 'Feature requests for my product',
  })

  return newUser
}
