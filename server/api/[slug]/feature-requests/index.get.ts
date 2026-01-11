import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { featureRequestRepository } from "../../../repositories/feature-request.repository";
import { badRequest } from "../../../utils/errors";
import type { Category, Status } from "~~/shared/constants/enums";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);
  const query = getQuery(event);

  const productId = query.productId as string;
  const status = query.status as Status | undefined;
  const category = query.category as Category | undefined;

  if (!productId) {
    badRequest("productId is required");
  }

  // Verify user has access to this product (owner or org member)
  const hasAccess = await productRepository.hasProductAccess(
    auth.orgId ?? "",
    productId
  );
  if (!hasAccess) {
    badRequest("Product not found");
  }

  const featureRequests = await featureRequestRepository.findAllByProductId(
    productId,
    {
      status,
      category,
    }
  );

  return { data: featureRequests };
});
