import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { processedMessageRepository } from "../../../repositories/processed-message.repository";
import { notFound, handleDbError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);
  const slug = getRouterParam(event, "slug");
  const id = getRouterParam(event, "id");

  if (!slug) {
    notFound("Product not found");
  }

  if (!id) {
    notFound("Message not found");
  }

  // Find product by slug
  const product = await productRepository.findBySlugOnly(slug);

  if (!product) {
    notFound("Product not found");
  }

  // Verify user has access to this product (owner or org member)
  const hasAccess = await productRepository.hasProductAccess(
    auth.orgId ?? "",
    product.id
  );
  if (!hasAccess) {
    notFound("Product not found");
  }

  // Get message to verify it belongs to this product
  const message = await processedMessageRepository.findById(id);

  if (!message) {
    notFound("Message not found");
  }

  // Verify message belongs to this product
  if (message.productId !== product.id) {
    notFound("Message not found");
  }

  try {
    await processedMessageRepository.delete(id);

    return { data: { success: true } };
  } catch (error) {
    handleDbError(error);
  }
});
