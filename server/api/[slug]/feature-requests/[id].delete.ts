import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { featureRequestRepository } from "../../../repositories/feature-request.repository";
import { notFound, handleDbError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    notFound("Feature request not found");
  }

  // Get the feature request to verify access
  const existing = await featureRequestRepository.findByIdWithProduct(id);
  if (!existing) {
    notFound("Feature request not found");
  }

  // Verify user has access to the product (owner or org member)
  const hasAccess = await productRepository.hasProductAccess(
    auth.orgId ?? "",
    existing.product.id
  );
  if (!hasAccess) {
    notFound("Feature request not found");
  }

  try {
    await featureRequestRepository.delete(id);
    return { data: { success: true } };
  } catch (error) {
    handleDbError(error);
  }
});
