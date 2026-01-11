import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { processedMessageRepository } from "../../../repositories/processed-message.repository";
import { notFound } from "../../../utils/errors";
import type { MessageSource } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    notFound("Product not found");
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

  const query = getQuery(event);

  const source = query.source as MessageSource | undefined;
  const isFeatureRequest = query.isFeatureRequest as string | undefined;
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;

  const result = await processedMessageRepository.findAllByProductIds(
    [product.id],
    {
      source,
      isFeatureRequest:
        isFeatureRequest !== undefined ? isFeatureRequest === "true" : undefined,
      page,
      limit,
    }
  );

  return result;
});
