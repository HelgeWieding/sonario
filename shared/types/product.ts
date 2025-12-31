// Re-export the base Product type from Drizzle schema (single source of truth)
export type { Product, NewProduct } from '~~/server/db/schema/products'

// Import for extending
import type { Product } from '~~/server/db/schema/products'

// Enriched types (not directly from DB)
export interface ProductWithStats extends Product {
  featureRequestCount: number
  newRequestCount: number
}

// API input types
export interface CreateProductInput {
  name: string
  description?: string
  emailFilter?: string
}

export interface UpdateProductInput {
  name?: string
  description?: string
  emailFilter?: string
  autoDraftsEnabled?: boolean
}
