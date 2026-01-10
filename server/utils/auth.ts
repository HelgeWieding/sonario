import type { H3Event } from "h3";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../db";

export async function requireAuth(event: H3Event) {
  const auth = event.context.auth();

  if (!auth.userId) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  return auth;
}

export async function getOrCreateUser(event: H3Event) {
  const auth = await requireAuth(event);
  const db = getDb();

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, auth.userId),
  });

  if (existingUser) {
    return existingUser;
  }

  // Create new user (product is created via onboarding)
  const [newUser] = await db
    .insert(schema.users)
    .values({
      clerkId: auth.userId,
      email: (auth.sessionClaims?.email as string) || "",
      firstName: (auth.sessionClaims?.first_name as string) || null,
      lastName: (auth.sessionClaims?.last_name as string) || null,
      imageUrl: (auth.sessionClaims?.image_url as string) || null,
    })
    .returning();

  return newUser;
}
