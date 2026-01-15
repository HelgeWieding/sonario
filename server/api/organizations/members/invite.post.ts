import { clerkClient } from "@clerk/nuxt/server";
import { getAuthContext } from "../../../utils/auth";

interface InviteBody {
  emailAddress: string;
  role: "org:admin" | "org:member";
}

export default defineEventHandler(async (event) => {
  const auth = getAuthContext(event);

  if (!auth.orgId) {
    throw createError({
      statusCode: 400,
      message: "No active organization",
    });
  }

  // Only admins can invite members
  if (auth.orgRole !== "org:admin") {
    throw createError({
      statusCode: 403,
      message: "Only admins can invite members",
    });
  }

  const body = await readBody<InviteBody>(event);

  if (!body.emailAddress) {
    throw createError({
      statusCode: 400,
      message: "Email address is required",
    });
  }

  try {
    const client = clerkClient(event);

    const invitation =
      await client.organizations.createOrganizationInvitation({
        organizationId: auth.orgId,
        emailAddress: body.emailAddress,
        role: body.role || "org:member",
        inviterUserId: auth.userId,
      });

    return {
      data: {
        id: invitation.id,
        emailAddress: invitation.emailAddress,
        role: invitation.role,
        status: invitation.status,
        createdAt: new Date(invitation.createdAt),
      },
    };
  } catch (error: any) {
    console.error("Failed to invite member:", error.message);

    // Handle specific Clerk errors
    if (error.errors?.[0]?.code === "duplicate_record") {
      throw createError({
        statusCode: 409,
        message: "An invitation has already been sent to this email",
      });
    }

    throw createError({
      statusCode: 500,
      message: error.errors?.[0]?.message || "Failed to invite member",
    });
  }
});
