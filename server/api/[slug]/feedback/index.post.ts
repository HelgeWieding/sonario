import { z } from "zod";
import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { featureRequestRepository } from "../../../repositories/feature-request.repository";
import { feedbackRepository } from "../../../repositories/feedback.repository";
import { processedMessageRepository } from "../../../repositories/processed-message.repository";
import { badRequest, notFound, handleDbError } from "../../../utils/errors";
import { SENTIMENTS } from "~~/shared/constants";

const createFeedbackSchema = z.object({
  featureRequestId: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
  sentiment: z.enum(SENTIMENTS).optional(),
  senderEmail: z.string().email().optional().or(z.literal("")),
  senderName: z.string().max(100).optional(),
  sourceMessageId: z.string().uuid().optional(),
});

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

  const body = await readBody(event);
  const result = createFeedbackSchema.safeParse(body);

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || "Invalid input");
  }

  // If featureRequestId is provided, verify it belongs to the same product
  if (result.data!.featureRequestId) {
    const featureRequest = await featureRequestRepository.findById(
      result.data!.featureRequestId
    );
    if (!featureRequest || featureRequest.productId !== product.id) {
      notFound("Feature request not found");
    }
  }

  try {
    const feedback = await feedbackRepository.create({
      productId: product.id,
      featureRequestId: result.data!.featureRequestId || null,
      content: result.data!.content,
      sentiment: result.data!.sentiment,
      senderEmail: result.data!.senderEmail || null,
      senderName: result.data!.senderName || null,
      aiExtracted: false,
    });

    // Increment feedback count on feature request if linked
    if (result.data!.featureRequestId) {
      await featureRequestRepository.incrementFeedbackCount(
        result.data!.featureRequestId
      );
    }

    // Update the source message with the feedback ID if provided
    if (result.data!.sourceMessageId) {
      await processedMessageRepository.update(result.data!.sourceMessageId, {
        feedbackId: feedback.id,
      });
    }

    return { data: feedback };
  } catch (error) {
    handleDbError(error);
  }
});
