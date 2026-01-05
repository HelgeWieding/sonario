import { getOrCreateUser } from '../../utils/auth'
import { getAuthContext } from '../../utils/organization'
import { productRepository } from '../../repositories/product.repository'
import type { ProductWithStats } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const auth = getAuthContext(event)

  let products

  if (auth.orgId) {
    // Organization context: return products belonging to this organization
    products = await productRepository.findAllByOrganizationId(auth.orgId)
  } else {
    // Personal context: return user's personal products (no org)
    products = await productRepository.findPersonalByUserId(user.id)
  }

  // Include stats for each product
  const productsWithStats: ProductWithStats[] = await Promise.all(
    products.map(async (product) => {
      const stats = await productRepository.getProductStats(product.id)
      return {
        ...product,
        ...stats,
      }
    }),
  )

  return { data: productsWithStats }
})
