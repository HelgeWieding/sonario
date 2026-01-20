import { eq } from "drizzle-orm";
import { getDb, schema } from "../db";
import type { Organization } from "../db/schema/organizations";

export interface UpsertOrganizationData {
  clerkId: string;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
}

class OrganizationRepository {
  private get db() {
    return getDb();
  }

  /**
   * Find an organization by its Clerk ID
   */
  async findByClerkId(clerkId: string): Promise<Organization | null> {
    const org = await this.db.query.organizations.findFirst({
      where: eq(schema.organizations.clerkId, clerkId),
    });
    return org ?? null;
  }

  /**
   * Create or update an organization by Clerk ID
   */
  async upsert(data: UpsertOrganizationData): Promise<Organization> {
    const existing = await this.findByClerkId(data.clerkId);

    if (existing) {
      const [updated] = await this.db
        .update(schema.organizations)
        .set({
          name: data.name,
          slug: data.slug ?? null,
          imageUrl: data.imageUrl ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.organizations.clerkId, data.clerkId))
        .returning();

      return updated;
    }

    const [created] = await this.db
      .insert(schema.organizations)
      .values({
        clerkId: data.clerkId,
        name: data.name,
        slug: data.slug ?? null,
        imageUrl: data.imageUrl ?? null,
      })
      .returning();

    return created;
  }

  /**
   * Mark an organization as having completed onboarding
   */
  async markOnboarded(clerkId: string): Promise<Organization | null> {
    const [org] = await this.db
      .update(schema.organizations)
      .set({
        hasCompletedOnboarding: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.organizations.clerkId, clerkId))
      .returning();

    return org ?? null;
  }

  /**
   * Check if an organization has completed onboarding
   */
  async hasCompletedOnboarding(clerkId: string): Promise<boolean> {
    const org = await this.findByClerkId(clerkId);
    return org?.hasCompletedOnboarding ?? false;
  }
}

export const organizationRepository = new OrganizationRepository();
