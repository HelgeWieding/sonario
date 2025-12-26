export interface Product {
  id: string
  userId: string
  name: string
  description: string | null
  emailFilter: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductWithStats extends Product {
  featureRequestCount: number
  newRequestCount: number
}

export interface CreateProductInput {
  name: string
  description?: string
  emailFilter?: string
}

export interface UpdateProductInput {
  name?: string
  description?: string
  emailFilter?: string
}
