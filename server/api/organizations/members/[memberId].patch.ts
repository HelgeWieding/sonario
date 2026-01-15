import { clerkClient } from "@clerk/nuxt/server";
import { getAuthContext } from "../../../utils/auth";

interface UpdateMemberBody {
  role: "org:admin" | "org:member";
}

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);
  const memberId = getRouterParam(event, "memberId");

  if (!auth.orgId) {
    throw createError({
      statusCode: 400,
      message: "No active organization",
    });
  }

  if (!memberId) {
    throw createError({
      statusCode: 400,
      message: "Member ID is required",
    });
  }

  // Only admins can update member roles
  if (auth.orgRole !== "org:admin") {
    throw createError({
      statusCode: 403,
      message: "Only admins can update member roles",
    });
  }

  const body = await readBody<UpdateMemberBody>(event);

  if (!body.role) {
    throw createError({
      statusCode: 400,
      message: "Role is required",
    });
  }

  try {
    const client = clerkClient(event);

    const membership =
      await client.organizations.updateOrganizationMembership({
        organizationId: auth.orgId,
        userId: memberId,
        role: body.role,
      });

    return {
      data: {
        id: membership.id,
        role: membership.role,
      },
    };
  } catch (error: any) {
    console.error("Failed to update member role:", error.message);
    throw createError({
      statusCode: 500,
      message: error.errors?.[0]?.message || "Failed to update member role",
    });
  }
});
