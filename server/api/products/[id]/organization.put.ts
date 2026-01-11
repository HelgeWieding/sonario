import { z } from "zod";
import { getOrCreateUser } from "../../../utils/auth";
import { getAuthContext } from "../../../utils/auth";
import { productRepository } from "../../../repositories/product.repository";
import { badRequest, notFound } from "../../../utils/errors";

const assignOrgSchema = z.object({
  organizationId: z.string().nullable(),
});

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event);
  const auth = getAuthContext(event);
  const productId = getRouterParam(event, "id");

  if (!productId) {
    notFound("Product not found");
  }

  const body = await readBody(event);
  const result = assignOrgSchema.safeParse(body);

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || "Invalid input");
  }

  const { organizationId } = result.data!;

  // If assigning to org, verify user is member of that org
  if (organizationId && organizationId !== auth.orgId) {
    badRequest(
      "Cannot assign product to an organization you are not actively using"
    );
  }

  let product;
  if (organizationId) {
    product = await productRepository.assignToOrganization(
      productId,
      user.id,
      organizationId
    );
  } else {
    product = await productRepository.removeFromOrganization(
      productId,
      user.id
    );
  }

  if (!product) {
    notFound("Product not found or you do not have permission to modify it");
  }

  return { data: product };
});
