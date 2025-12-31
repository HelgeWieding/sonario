import { eq, and, count } from 'drizzle-orm'
import { getDb, schema } from '../db'
import type { Product, ProductWithStats } from '~~/shared/types'

export interface CreateProductData {
  userId: string
  name: string
  description?: string | null
  emailFilter?: string | null
}

export interface UpdateProductData {
  name?: string
  description?: string | null
  emailFilter?: string | null
  autoDraftsEnabled?: boolean
}

class ProductRepository {
  private get db() {
    return getDb()
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
    })
    return !!product
  }

  /**
   * Find all products for a user, ordered by creation date
   */
  async findAllByUserId(userId: string): Promise<Product[]> {
    return await this.db.query.products.findMany({
      where: eq(schema.products.userId, userId),
      orderBy: (products, { asc }) => [asc(products.createdAt)],
    })
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductData): Promise<Product> {
    const [product] = await this.db.insert(schema.products).values({
      userId: data.userId,
      name: data.name,
      description: data.description ?? null,
      emailFilter: data.emailFilter ?? null,
    }).returning()

    return product
  }

  /**
   * Find a product by ID and user ID, including stats
   */
  async findWithStats(id: string, userId: string): Promise<ProductWithStats | null> {
    const product = await this.db.query.products.findFirst({
      where: and(
        eq(schema.products.id, id),
        eq(schema.products.userId, userId)
      ),
    })

    if (!product) {
      return null
    }

    // Get feature request count
    const [{ count: featureRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(eq(schema.featureRequests.productId, product.id))

    // Get new request count
    const [{ count: newRequestCount }] = await this.db
      .select({ count: count() })
      .from(schema.featureRequests)
      .where(
        and(
          eq(schema.featureRequests.productId, product.id),
          eq(schema.featureRequests.status, 'new')
        )
      )

    return {
      ...product,
      featureRequestCount: Number(featureRequestCount),
      newRequestCount: Number(newRequestCount),
    }
  }

  /**
   * Update a product by ID and user ID
   * Returns null if product not found or doesn't belong to user
   */
  async update(id: string, userId: string, data: UpdateProductData): Promise<Product | null> {
    const [product] = await this.db
      .update(schema.products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.userId, userId)
        )
      )
      .returning()

    return product ?? null
  }

  /**
   * Delete a product by ID and user ID
   * Returns the deleted product or null if not found
   */
  async delete(id: string, userId: string): Promise<Product | null> {
    const [product] = await this.db
      .delete(schema.products)
      .where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.userId, userId)
        )
      )
      .returning()

    return product ?? null
  }
}

// Singleton export
export const productRepository = new ProductRepository()
