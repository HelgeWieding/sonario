import { getOrCreateUser } from "../../../utils/auth";
import { hasProductAccess } from "../../../utils/organization";
import { productRepository } from "../../../repositories/product.repository";
import { contactRepository } from "../../../repositories/contact.repository";
import { notFound } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event);
  const slug = getRouterParam(event, "slug");
  const contactId = getRouterParam(event, "id");

  if (!slug) {
    notFound("Product not found");
  }

  if (!contactId) {
    notFound("Contact not found");
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

  // Verify contact belongs to this product
  const contactExists = await contactRepository.findByIdWithinProducts(
    contactId,
    [product.id]
  );
  if (!contactExists) {
    notFound("Contact not found");
  }

  // Get the contact with all feedback
  const contact = await contactRepository.findByIdWithFeedback(contactId);
  if (!contact) {
    notFound("Contact not found");
  }

  return { data: contact };
});
