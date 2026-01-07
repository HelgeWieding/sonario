import { getOrCreateUser } from "../../../utils/auth";
import { hasProductAccess } from "../../../utils/organization";
import { productRepository } from "../../../repositories/product.repository";
import { feedbackRepository } from "../../../repositories/feedback.repository";
import { notFound } from "../../../utils/errors";
import type { Sentiment } from "~~/shared/constants/enums";

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event);
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
  const hasAccess = await hasProductAccess(event, product.id, user.id);
  if (!hasAccess) {
    notFound("Product not found");
  }

  const query = getQuery(event);

  const sentiment = query.sentiment as Sentiment | undefined;
  const featureRequestId = query.featureRequestId as string | undefined;
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;

  const result = await feedbackRepository.findAllByProductIds([product.id], {
    sentiment,
    featureRequestId,
    page,
    limit,
  });

  return result;
});
