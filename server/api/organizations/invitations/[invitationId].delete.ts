import { clerkClient } from "@clerk/nuxt/server";
import { getAuthContext } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);
  const invitationId = getRouterParam(event, "invitationId");

  if (!auth.orgId) {
    throw createError({
      statusCode: 400,
      message: "No active organization",
    });
  }

  if (!invitationId) {
    throw createError({
      statusCode: 400,
      message: "Invitation ID is required",
    });
  }

  // Only admins can revoke invitations
  if (auth.orgRole !== "org:admin") {
    throw createError({
      statusCode: 403,
      message: "Only admins can revoke invitations",
    });
  }

  try {
    const client = clerkClient(event);

    await client.organizations.revokeOrganizationInvitation({
      organizationId: auth.orgId,
      invitationId: invitationId,
      requestingUserId: auth.userId,
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Failed to revoke invitation:", error.message);
    throw createError({
      statusCode: 500,
      message: error.errors?.[0]?.message || "Failed to revoke invitation",
    });
  }
});
