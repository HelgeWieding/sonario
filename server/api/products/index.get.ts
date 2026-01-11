import { getOrCreateUser } from "../../utils/auth";
import { productRepository } from "../../repositories/product.repository";
import { notFound } from "../../utils/errors";

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event);

  // Get all products
  const products = await productRepository.findAll();
  if (products.length === 0) {
    return notFound("No product found");
  }

  const product = products[0];
  const stats = await productRepository.getProductStats(product.id);

  return {
    data: {
      ...product,
      ...stats,
    },
  };
});
