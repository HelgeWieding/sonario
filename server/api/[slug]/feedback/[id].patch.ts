import { z } from "zod";
import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { feedbackRepository } from "../../../repositories/feedback.repository";
import { featureRequestRepository } from "../../../repositories/feature-request.repository";
import { notFound, badRequest, handleDbError } from "../../../utils/errors";

const updateFeedbackSchema = z.object({
  featureRequestId: z.string().uuid().nullable(),
});

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

  // Get feedback to verify it belongs to this product
  const existing = await feedbackRepository.findById(id);

  if (!existing) {
    notFound("Feedback not found");
  }

  if (existing.productId !== product.id) {
    notFound("Feedback not found");
  }

  const body = await readBody(event);
  const result = updateFeedbackSchema.safeParse(body);

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || "Invalid input");
  }

  const newFeatureRequestId = result.data!.featureRequestId;

  // Validate the new feature request if provided
  if (newFeatureRequestId) {
    const featureRequest = await featureRequestRepository.findById(newFeatureRequestId);
    if (!featureRequest || featureRequest.productId !== product.id) {
      notFound("Feature request not found");
    }
  }

  try {
    // Update feedback count on old feature request (decrement)
    if (existing.featureRequestId && existing.featureRequestId !== newFeatureRequestId) {
      await featureRequestRepository.decrementFeedbackCount(existing.featureRequestId);
    }

    // Update feedback
    const feedback = await feedbackRepository.updateFeatureRequestId(id, newFeatureRequestId);

    // Update feedback count on new feature request (increment)
    if (newFeatureRequestId && existing.featureRequestId !== newFeatureRequestId) {
      await featureRequestRepository.incrementFeedbackCount(newFeatureRequestId);
    }

    return { data: feedback };
  } catch (error) {
    handleDbError(error);
  }
});
