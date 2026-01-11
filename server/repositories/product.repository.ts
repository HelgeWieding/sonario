import { eq, and, count, isNull } from "drizzle-orm";
import { getDb, schema } from "../db";
import type { Product, ProductWithStats } from "~~/shared/types";

export interface CreateProductData {
  userId: string;
  organizationId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  emailFilter?: string | null;
}

export interface UpdateProductData {
  name?: string;
  slug?: string;
  description?: string | null;
  emailFilter?: string | null;
  autoDraftsEnabled?: boolean;
}

class ProductRepository {
  private get db() {
    return getDb();
  }

  /**
   * Check if a user owns a product
   */
  async verifyOwnership(productId: string, userId: string): Promise<boolean> {
    const product = await this.db.query.products.findFirst({
      where: and(
        eq(schema.products.id, productId),
        eq(schema.products.userId, userId)
      ),
    });
    return !!product;
  }

  /**
   * Find all products for a user, ordered by creation date
   */
  async findAllByUserId(userId: string): Promise<Product[]> {
    return await this.db.query.products.findMany({
      where: eq(schema.products.userId, userId),
      orderBy: (products, { asc }) => [asc(products.createdAt)],
    });
  }

  /**
   * Find the user's first (and only) product with stats
   */
  async findFirstWithStats(userId: string): Promise<ProductWithStats | null> {
    const product = await this.db.query.products.findFirst({
      where: eq(schema.products.userId, userId),
      orderBy: (products, { asc }) => [asc(products.createdAt)],
    });

    if (!product) {
      return null;
    }

    const [{ count: featureRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(eq(schema.featureRequests.productId, product.id));

    const [{ count: newRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(
        and(
          eq(schema.featureRequests.productId, product.id),
          eq(schema.featureRequests.status, "new")
        )
      );

    return {
      ...product,
      featureRequestCount: Number(featureRequestCount),
      newRequestCount: Number(newRequestCount),
    };
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductData): Promise<Product> {
    const [product] = await this.db
      .insert(schema.products)
      .values({
        userId: data.userId,
        organizationId: data.organizationId ?? null,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        emailFilter: data.emailFilter ?? null,
      })
      .returning();

    return product;
  }

  /**
   * Find a product by slug and user ID
   */
  async findBySlug(slug: string, userId: string): Promise<Product | null> {
    const product = await this.db.query.products.findFirst({
      where: and(
        eq(schema.products.slug, slug),
        eq(schema.products.userId, userId)
      ),
    });
    return product ?? null;
  }

  /**
   * Find a product by slug (without user filter)
   * Used for org-aware access where access is checked separately
   */
  async findBySlugOnly(slug: string): Promise<Product | null> {
    const product = await this.db.query.products.findFirst({
      where: eq(schema.products.slug, slug),
    });
    return product ?? null;
  }

  /**
   * Get stats for a product (used after access verification)
   */
  async getProductStats(
    productId: string
  ): Promise<{ featureRequestCount: number; newRequestCount: number }> {
    const [{ count: featureRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(eq(schema.featureRequests.productId, productId));

    const [{ count: newRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(
        and(
          eq(schema.featureRequests.productId, productId),
          eq(schema.featureRequests.status, "new")
        )
      );

    return {
      featureRequestCount: Number(featureRequestCount),
      newRequestCount: Number(newRequestCount),
    };
  }

  /**
   * Find a product by slug with stats
   */
  async findBySlugWithStats(
    slug: string,
    userId: string
  ): Promise<ProductWithStats | null> {
    const product = await this.findBySlug(slug, userId);

    if (!product) {
      return null;
    }

    const [{ count: featureRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(eq(schema.featureRequests.productId, product.id));

    const [{ count: newRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(
        and(
          eq(schema.featureRequests.productId, product.id),
          eq(schema.featureRequests.status, "new")
        )
      );

    return {
      ...product,
      featureRequestCount: Number(featureRequestCount),
      newRequestCount: Number(newRequestCount),
    };
  }

  /**
   * Find a product by ID and user ID, including stats
   */
  async findWithStats(
    id: string,
    userId: string
  ): Promise<ProductWithStats | null> {
    const product = await this.db.query.products.findFirst({
      where: and(
        eq(schema.products.id, id),
        eq(schema.products.userId, userId)
      ),
    });

    if (!product) {
      return null;
    }

    // Get feature request count
    const [{ count: featureRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(eq(schema.featureRequests.productId, product.id));

    // Get new request count
    const [{ count: newRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(
        and(
          eq(schema.featureRequests.productId, product.id),
          eq(schema.featureRequests.status, "new")
        )
      );

    return {
      ...product,
      featureRequestCount: Number(featureRequestCount),
      newRequestCount: Number(newRequestCount),
    };
  }

  /**
   * Update a product by ID and user ID
   * Returns null if product not found or doesn't belong to user
   */
  async update(
    id: string,
    userId: string,
    data: UpdateProductData
  ): Promise<Product | null> {
    const [product] = await this.db
      .update(schema.products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(eq(schema.products.id, id), eq(schema.products.userId, userId))
      )
      .returning();

    return product ?? null;
  }

  /**
   * Update the user's first (and only) product
   * Returns null if no product found
   */
  async updateFirst(
    userId: string,
    data: UpdateProductData
  ): Promise<Product | null> {
    // First find the product
    const existing = await this.db.query.products.findFirst({
      where: eq(schema.products.userId, userId),
      orderBy: (products, { asc }) => [asc(products.createdAt)],
    });

    if (!existing) {
      return null;
    }

    // Update it
    const [product] = await this.db
      .update(schema.products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, existing.id))
      .returning();

    return product ?? null;
  }

  /**
   * Delete a product by ID and user ID
   * Returns the deleted product or null if not found
   */
  async delete(id: string, userId: string): Promise<Product | null> {
    const [product] = await this.db
      .delete(schema.products)
      .where(
        and(eq(schema.products.id, id), eq(schema.products.userId, userId))
      )
      .returning();

    return product ?? null;
  }

  /**
   * Find all products
   */
  async findAll(): Promise<Product[]> {
    return await this.db.query.products.findMany({
      orderBy: (products, { asc }) => [asc(products.createdAt)],
    });
  }

  /**
   * Assign a product to an organization
   * Only the product owner can do this
   */
  async assignToOrganization(
    productId: string,
    userId: string,
    organizationId: string
  ): Promise<Product | null> {
    const [product] = await this.db
      .update(schema.products)
      .set({
        organizationId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.products.id, productId),
          eq(schema.products.userId, userId)
        )
      )
      .returning();

    return product ?? null;
  }

  /**
   * Remove a product from its organization
   * Only the product owner can do this
   */
  async removeFromOrganization(
    productId: string,
    userId: string
  ): Promise<Product | null> {
    const [product] = await this.db
      .update(schema.products)
      .set({
        organizationId: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.products.id, productId),
          eq(schema.products.userId, userId)
        )
      )
      .returning();

    return product ?? null;
  }

  /**
   * Find all products belonging to an organization
   */
  async findAllByOrganizationId(organizationId: string): Promise<Product[]> {
    return await this.db.query.products.findMany({
      where: eq(schema.products.organizationId, organizationId),
      orderBy: (products, { asc }) => [asc(products.createdAt)],
    });
  }

  /**
   * Check if an organization has any products
   */
  async organizationHasProducts(organizationId: string): Promise<boolean> {
    const product = await this.db.query.products.findFirst({
      where: eq(schema.products.organizationId, organizationId),
      columns: { id: true },
    });
    return !!product;
  }

  /**
   * Check if user has access to a product in the CURRENT context.
   * - In org context: product must belong to the active organization
   * - In personal context: product must be personal (no org) and owned by user
   */
  async hasProductAccess(orgId: string, productId: string): Promise<boolean> {
    const db = getDb();

    const product = await db.query.products.findFirst({
      where: and(
        eq(schema.products.id, productId),
        eq(schema.products.organizationId, orgId)
      ),
    });

    if (!product) return false;
    return true;
  }
}

// Singleton export
export const productRepository = new ProductRepository();
