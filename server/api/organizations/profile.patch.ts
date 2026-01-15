import { clerkClient } from "@clerk/nuxt/server";
import { getAuthContext } from "../../utils/auth";

interface UpdateProfileBody {
  name?: string;
  slug?: string;
}

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);

  if (!auth.orgId) {
    throw createError({
      statusCode: 400,
      message: "No active organization",
    });
  }

  // Only admins can update the organization profile
  if (auth.orgRole !== "org:admin") {
    throw createError({
      statusCode: 403,
      message: "Only admins can update the organization profile",
    });
  }

  const body = await readBody<UpdateProfileBody>(event);

  if (!body.name && !body.slug) {
    throw createError({
      statusCode: 400,
      message: "At least one field (name or slug) is required",
    });
  }

  try {
    const client = clerkClient(event);

    const updateData: { name?: string; slug?: string } = {};
    if (body.name) updateData.name = body.name;
    if (body.slug) updateData.slug = body.slug;

    const organization = await client.organizations.updateOrganization(
      auth.orgId,
      updateData
    );

    return {
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        imageUrl: organization.imageUrl,
      },
    };
  } catch (error: any) {
    console.error("Failed to update organization profile:", error.message);
    throw createError({
      statusCode: 500,
      message:
        error.errors?.[0]?.message || "Failed to update organization profile",
    });
  }
});
