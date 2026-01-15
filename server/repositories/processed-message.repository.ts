import { eq, and, desc, count, inArray } from 'drizzle-orm'
import { getDb, schema } from '../db'
import type { ProcessedMessage, MessageSource } from '~~/server/db/schema/processed-messages'

export interface CreateProcessedMessageData {
  productId: string
  source: MessageSource
  sourceMessageId: string
  sourceThreadId?: string | null
  subject?: string | null
  senderEmail?: string | null
  senderName?: string | null
  content?: string | null
  isFeatureRequest?: boolean
}

export interface UpdateProcessedMessageData {
  isFeatureRequest?: boolean
  featureRequestId?: string | null
  feedbackId?: string | null
}

export interface FindAllOptions {
  source?: MessageSource
  isFeatureRequest?: boolean
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

class ProcessedMessageRepository {
  private get db() {
    return getDb()
  }

  /**
   * Check if a message has already been processed
   */
  async findBySourceId(
    source: MessageSource,
    sourceMessageId: string
  ): Promise<ProcessedMessage | null> {
    return await this.db.query.processedMessages.findFirst({
      where: and(
        eq(schema.processedMessages.source, source),
        eq(schema.processedMessages.sourceMessageId, sourceMessageId)
      ),
    }) ?? null
  }

  /**
   * Create a new processed message record
   */
  async create(data: CreateProcessedMessageData): Promise<ProcessedMessage> {
    const [message] = await this.db.insert(schema.processedMessages).values({
      productId: data.productId,
      source: data.source,
      sourceMessageId: data.sourceMessageId,
      sourceThreadId: data.sourceThreadId ?? null,
      subject: data.subject ?? null,
      senderEmail: data.senderEmail ?? null,
      senderName: data.senderName ?? null,
      content: data.content ?? null,
      isFeatureRequest: data.isFeatureRequest ?? false,
    }).returning()

    return message
  }

  /**
   * Update a processed message (e.g., to link feature request or feedback)
   */
  async update(id: string, data: UpdateProcessedMessageData): Promise<ProcessedMessage | null> {
    const [message] = await this.db
      .update(schema.processedMessages)
      .set(data)
      .where(eq(schema.processedMessages.id, id))
      .returning()

    return message ?? null
  }

  /**
   * Find a message by ID
   */
  async findById(id: string): Promise<ProcessedMessage | null> {
    return await this.db.query.processedMessages.findFirst({
      where: eq(schema.processedMessages.id, id),
    }) ?? null
  }

  /**
   * Delete a processed message
   */
  async delete(id: string): Promise<void> {
    await this.db
      .delete(schema.processedMessages)
      .where(eq(schema.processedMessages.id, id))
  }

  /**
   * Find all messages for multiple products with pagination and filters
   */
  async findAllByProductIds(
    productIds: string[],
    options: FindAllOptions = {}
  ): Promise<PaginatedResult<ProcessedMessage>> {
    const page = Math.max(1, options.page ?? 1)
    const limit = Math.min(100, Math.max(1, options.limit ?? 20))
    const offset = (page - 1) * limit

    // Build conditions
    const conditions = [inArray(schema.processedMessages.productId, productIds)]

    if (options.source) {
      conditions.push(eq(schema.processedMessages.source, options.source))
    }
    if (options.isFeatureRequest !== undefined) {
      conditions.push(eq(schema.processedMessages.isFeatureRequest, options.isFeatureRequest))
    }

    const whereClause = and(...conditions)

    // Get total count
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(schema.processedMessages)
      .where(whereClause)

    // Get paginated messages
    const messages = await this.db.query.processedMessages.findMany({
      where: whereClause,
      orderBy: [desc(schema.processedMessages.processedAt)],
      limit,
      offset,
    })

    return {
      data: messages,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    }
  }
}

// Singleton export
export const processedMessageRepository = new ProcessedMessageRepository()
