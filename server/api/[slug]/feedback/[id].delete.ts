import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { feedbackRepository } from "../../../repositories/feedback.repository";
import { featureRequestRepository } from "../../../repositories/feature-request.repository";
import { notFound, handleDbError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);
  const slug = getRouterParam(event, "slug");
  const id = getRouterParam(event, "id");

  if (!slug) {
    notFound("Product not found");
  }

  if (!id) {
    notFound("Feedback not found");
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

  // Get feedback with relations to verify it belongs to this product
  const feedbackItem = await feedbackRepository.findByIdWithRelations(id);

  if (!feedbackItem) {
    notFound("Feedback not found");
  }

  // Verify feedback belongs to this product
  if (feedbackItem.productId !== product.id) {
    notFound("Feedback not found");
  }

  try {
    await feedbackRepository.delete(id);

    // Decrement feedback count on feature request
    if (feedbackItem.featureRequestId) {
      await featureRequestRepository.decrementFeedbackCount(
        feedbackItem.featureRequestId
      );
    }

    return { data: { success: true } };
  } catch (error) {
    handleDbError(error);
  }
});
