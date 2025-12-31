import { eq, and, desc, sql } from 'drizzle-orm'
import { getDb, schema } from '../db'
import type { FeatureRequest, FeatureRequestWithFeedback } from '~~/shared/types'
import type { Category, Status } from '~~/shared/constants/enums'

export interface CreateFeatureRequestData {
  productId: string
  title: string
  description: string
  originalContent?: string | null
  category?: Category
  aiGenerated?: boolean
  sourceEmailId?: string | null
}

export interface UpdateFeatureRequestData {
  title?: string
  description?: string
  category?: Category
  status?: Status
}

export interface FindAllOptions {
  status?: Status
  category?: Category
  limit?: number
  orderByFeedbackCount?: boolean
}

class FeatureRequestRepository {
  private get db() {
    return getDb()
  }

  /**
   * Find all feature requests for a product with optional filters
   */
  async findAllByProductId(
    productId: string,
    options: FindAllOptions = {}
  ): Promise<FeatureRequest[]> {
    const conditions = [eq(schema.featureRequests.productId, productId)]

    if (options.status) {
      conditions.push(eq(schema.featureRequests.status, options.status))
    }
    if (options.category) {
      conditions.push(eq(schema.featureRequests.category, options.category))
    }

    return await this.db.query.featureRequests.findMany({
      where: and(...conditions),
      orderBy: options.orderByFeedbackCount
        ? [desc(schema.featureRequests.feedbackCount)]
        : [desc(schema.featureRequests.createdAt)],
      limit: options.limit,
    })
  }

  /**
   * Find a feature request by ID
   */
  async findById(id: string): Promise<FeatureRequest | null> {
    return await this.db.query.featureRequests.findFirst({
      where: eq(schema.featureRequests.id, id),
    }) ?? null
  }

  /**
   * Find a feature request by ID with its product (for ownership verification)
   */
  async findByIdWithProduct(id: string): Promise<(FeatureRequest & { product: { userId: string } }) | null> {
    return await this.db.query.featureRequests.findFirst({
      where: eq(schema.featureRequests.id, id),
      with: { product: true },
    }) ?? null
  }

  /**
   * Find a feature request by ID with feedback list
   */
  async findByIdWithFeedback(id: string): Promise<FeatureRequestWithFeedback | null> {
    const featureRequest = await this.db.query.featureRequests.findFirst({
      where: eq(schema.featureRequests.id, id),
      with: { product: true },
    })

    if (!featureRequest) {
      return null
    }

    const feedbackList = await this.db.query.feedback.findMany({
      where: eq(schema.feedback.featureRequestId, id),
      orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
    })

    return {
      ...featureRequest,
      feedback: feedbackList,
    } as FeatureRequestWithFeedback
  }

  /**
   * Get feedback for a feature request
   */
  async getFeedback(featureRequestId: string) {
    return await this.db.query.feedback.findMany({
      where: eq(schema.feedback.featureRequestId, featureRequestId),
      orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
    })
  }

  /**
   * Create a new feature request
   */
  async create(data: CreateFeatureRequestData): Promise<FeatureRequest> {
    const [featureRequest] = await this.db.insert(schema.featureRequests).values({
      productId: data.productId,
      title: data.title,
      description: data.description,
      originalContent: data.originalContent ?? null,
      category: data.category ?? 'feature',
      aiGenerated: data.aiGenerated ?? false,
      sourceEmailId: data.sourceEmailId ?? null,
    }).returning()

    return featureRequest
  }

  /**
   * Update a feature request by ID
   */
  async update(id: string, data: UpdateFeatureRequestData): Promise<FeatureRequest | null> {
    const [featureRequest] = await this.db
      .update(schema.featureRequests)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.featureRequests.id, id))
      .returning()

    return featureRequest ?? null
  }

  /**
   * Increment the feedback count for a feature request
   */
  async incrementFeedbackCount(id: string): Promise<FeatureRequest | null> {
    const [featureRequest] = await this.db
      .update(schema.featureRequests)
      .set({
        feedbackCount: sql`${schema.featureRequests.feedbackCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.featureRequests.id, id))
      .returning()

    return featureRequest ?? null
  }

  /**
   * Decrement the feedback count for a feature request (minimum 0)
   */
  async decrementFeedbackCount(id: string): Promise<FeatureRequest | null> {
    const [featureRequest] = await this.db
      .update(schema.featureRequests)
      .set({
        feedbackCount: sql`GREATEST(${schema.featureRequests.feedbackCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(schema.featureRequests.id, id))
      .returning()

    return featureRequest ?? null
  }

  /**
   * Delete a feature request by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.featureRequests)
      .where(eq(schema.featureRequests.id, id))

    return (result.rowCount ?? 0) > 0
  }
}

// Singleton export
export const featureRequestRepository = new FeatureRequestRepository()
