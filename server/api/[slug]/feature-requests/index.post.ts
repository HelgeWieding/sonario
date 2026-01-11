import { z } from "zod";
import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { featureRequestRepository } from "../../../repositories/feature-request.repository";
import { badRequest, handleDbError } from "../../../utils/errors";
import { CATEGORIES } from "~~/shared/constants";

const createFeatureRequestSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.enum(CATEGORIES).optional(),
});

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);

  const body = await readBody(event);
  const result = createFeatureRequestSchema.safeParse(body);

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || "Invalid input");
  }

  // Verify user has access to this product (owner or org member)
  const hasAccess = await productRepository.hasProductAccess(
    auth.orgId ?? "",
    result.data.productId
  );

  if (!hasAccess) {
    badRequest("Product not found");
  }

  try {
    const featureRequest = await featureRequestRepository.create({
      productId: result.data!.productId,
      title: result.data!.title,
      description: result.data!.description,
      category: result.data!.category,
      aiGenerated: false,
    });

    return { data: featureRequest };
  } catch (error) {
    handleDbError(error);
  }
});
