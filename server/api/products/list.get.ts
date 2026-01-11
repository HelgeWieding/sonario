import { getOrCreateUser } from "../../utils/auth";
import { getAuthContext } from "../../utils/auth";
import { productRepository } from "../../repositories/product.repository";
import type { ProductWithStats } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);

  let products;

  if (auth.orgId) {
    // Organization context: return products belonging to this organization
    products = await productRepository.findAllByOrganizationId(auth.orgId);
  } else {
    return notFound("No products found");
  }

  // Include stats for each product
  const productsWithStats: ProductWithStats[] = await Promise.all(
    products.map(async (product) => {
      const stats = await productRepository.getProductStats(product.id);
      return {
        ...product,
        ...stats,
      };
    })
  );

  return { data: productsWithStats };
});
