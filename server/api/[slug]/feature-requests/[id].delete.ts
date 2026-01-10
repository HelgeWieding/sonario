import { getOrCreateUser } from "../../../utils/auth";
import { hasProductAccess } from "../../../utils/organization";
import { featureRequestRepository } from "../../../repositories/feature-request.repository";
import { notFound, handleDbError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event);
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
  const hasAccess = await hasProductAccess(event, existing.product.id, user.id);
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
