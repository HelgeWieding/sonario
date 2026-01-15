import { clerkClient } from "@clerk/nuxt/server";
import { getAuthContext } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);
  const orgId = getRouterParam(event, "orgId");

  if (!auth.orgId) {
    throw createError({
      statusCode: 400,
      message: "No active organization",
    });
  }

  if (!orgId || orgId !== auth.orgId) {
    throw createError({
      statusCode: 400,
      message: "Invalid organization ID",
    });
  }

  // Only admins can delete the organization
  if (auth.orgRole !== "org:admin") {
    throw createError({
      statusCode: 403,
      message: "Only admins can delete the organization",
    });
  }

  try {
    const client = clerkClient(event);

    await client.organizations.deleteOrganization(auth.orgId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Failed to delete organization:", error.message);
    throw createError({
      statusCode: 500,
      message: error.errors?.[0]?.message || "Failed to delete organization",
    });
  }
});
