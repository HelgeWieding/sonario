import { clerkClient } from "@clerk/nuxt/server";
import { getAuthContext } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);

  if (!auth.orgId) {
    throw createError({
      statusCode: 400,
      message: "No active organization",
    });
  }

  try {
    const client = clerkClient(event);

    // Check if user is the only admin
    const { data: memberships } =
      await client.organizations.getOrganizationMembershipList({
        organizationId: auth.orgId,
        limit: 100,
      });

    const admins = memberships.filter((m) => m.role === "org:admin");
    const isOnlyAdmin =
      admins.length === 1 &&
      admins[0].publicUserData?.userId === auth.userId;

    if (isOnlyAdmin && memberships.length > 1) {
      throw createError({
        statusCode: 400,
        message:
          "You are the only admin. Please promote another member to admin before leaving.",
      });
    }

    // Remove the user from the organization
    await client.organizations.deleteOrganizationMembership({
      organizationId: auth.orgId,
      userId: auth.userId,
    });

    return {
      success: true,
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error; // Re-throw our custom errors
    }
    console.error("Failed to leave organization:", error.message);
    throw createError({
      statusCode: 500,
      message: error.errors?.[0]?.message || "Failed to leave organization",
    });
  }
});
