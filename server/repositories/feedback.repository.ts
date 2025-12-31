import { eq, and, desc, count, inArray, sql } from 'drizzle-orm'
import { getDb, schema } from '../db'
import type { Feedback } from '~~/server/db/schema/feedback'
import type { Sentiment } from '~~/shared/constants/enums'
import type { MessageSource } from '~~/server/db/schema/processed-messages'

export interface CreateFeedbackData {
  productId: string
  featureRequestId?: string | null
  contactId?: string | null
  content: string
  sentiment?: Sentiment
  source?: MessageSource | null
  senderEmail?: string | null
  senderName?: string | null
  emailMessageId?: string | null
  aiExtracted?: boolean
}

export interface FeedbackWithRelations extends Feedback {
  featureRequest: {
    id: string
    title: string
  } | null
  contact: {
    id: string
    email: string
    name: string | null
  } | null
}

export interface FindAllOptions {
  sentiment?: Sentiment
  featureRequestId?: string
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class FeedbackRepository {
  private get db() {
    return getDb()
  }

  /**
   * Find feedback by ID
   */
  async findById(id: string): Promise<Feedback | null> {
    return await this.db.query.feedback.findFirst({
      where: eq(schema.feedback.id, id),
    }) ?? null
  }

  /**
   * Find feedback by ID with full relations for ownership verification
   */
  async findByIdWithRelations(id: string): Promise<(Feedback & {
    featureRequest: {
      id: string
      productId: string
      product: { userId: string }
    } | null
  }) | null> {
    return await this.db.query.feedback.findFirst({
      where: eq(schema.feedback.id, id),
      with: {
        featureRequest: {
          with: { product: true },
        },
      },
    }) ?? null
  }

  /**
   * Create new feedback
   */
  async create(data: CreateFeedbackData): Promise<Feedback> {
    const [feedback] = await this.db.insert(schema.feedback).values({
      productId: data.productId,
      featureRequestId: data.featureRequestId ?? null,
      contactId: data.contactId ?? null,
      content: data.content,
      sentiment: data.sentiment ?? 'neutral',
      source: data.source ?? null,
      senderEmail: data.senderEmail ?? null,
      senderName: data.senderName ?? null,
      emailMessageId: data.emailMessageId ?? null,
      aiExtracted: data.aiExtracted ?? false,
    }).returning()

    return feedback
  }

  /**
   * Delete feedback by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.feedback)
      .where(eq(schema.feedback.id, id))

    return (result.rowCount ?? 0) > 0
  }

  /**
   * Find all feedback for products with pagination and relations
   */
  async findAllByProductIds(
    productIds: string[],
    options: FindAllOptions = {}
  ): Promise<PaginatedResult<FeedbackWithRelations>> {
    const page = Math.max(1, options.page ?? 1)
    const limit = Math.min(100, Math.max(1, options.limit ?? 20))
    const offset = (page - 1) * limit

    // Build conditions
    const conditions = [inArray(schema.feedback.productId, productIds)]

    if (options.sentiment) {
      conditions.push(eq(schema.feedback.sentiment, options.sentiment))
    }
    if (options.featureRequestId) {
      conditions.push(eq(schema.feedback.featureRequestId, options.featureRequestId))
    }

    const whereClause = and(...conditions)

    // Get total count
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(schema.feedback)
      .where(whereClause)

    // Get paginated feedback with relations
    const feedbackList = await this.db.query.feedback.findMany({
      where: whereClause,
      orderBy: [desc(schema.feedback.createdAt)],
      limit,
      offset,
      with: {
        featureRequest: {
          columns: {
            id: true,
            title: true,
          },
        },
        contact: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return {
      data: feedbackList as FeedbackWithRelations[],
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    }
  }

  /**
   * Find all feedback for a contact
   */
  async findAllByContactId(contactId: string): Promise<Feedback[]> {
    return await this.db.query.feedback.findMany({
      where: eq(schema.feedback.contactId, contactId),
      orderBy: [desc(schema.feedback.createdAt)],
    })
  }

  /**
   * Find all feedback for a feature request
   */
  async findAllByFeatureRequestId(featureRequestId: string): Promise<Feedback[]> {
    return await this.db.query.feedback.findMany({
      where: eq(schema.feedback.featureRequestId, featureRequestId),
      orderBy: [desc(schema.feedback.createdAt)],
    })
  }
}

// Singleton export
export const feedbackRepository = new FeedbackRepository()
