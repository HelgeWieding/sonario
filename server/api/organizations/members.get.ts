import { clerkClient } from "@clerk/nuxt/server";
import { getAuthContext } from "../../utils/auth";

export interface OrganizationMember {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: string;
  createdAt: Date;
}

export interface PendingInvitation {
  id: string;
  emailAddress: string;
  role: string;
  status: string;
  createdAt: Date;
}

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

    // Get organization members
    const { data: memberships } =
      await client.organizations.getOrganizationMembershipList({
        organizationId: auth.orgId,
        limit: 100,
      });

    // Get pending invitations
    const { data: invitations } =
      await client.organizations.getOrganizationInvitationList({
        organizationId: auth.orgId,
        status: ["pending"],
        limit: 100,
      });

    const members: OrganizationMember[] = memberships.map((m) => ({
      id: m.id,
      clerkUserId: m.publicUserData?.userId || "",
      email: m.publicUserData?.identifier || "",
      firstName: m.publicUserData?.firstName || null,
      lastName: m.publicUserData?.lastName || null,
      imageUrl: m.publicUserData?.imageUrl || null,
      role: m.role,
      createdAt: new Date(m.createdAt),
    }));

    const pendingInvitations: PendingInvitation[] = invitations.map((inv) => ({
      id: inv.id,
      emailAddress: inv.emailAddress,
      role: inv.role,
      status: inv.status,
      createdAt: new Date(inv.createdAt),
    }));

    return {
      data: {
        members,
        pendingInvitations,
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch organization members:", error.message);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch organization members",
    });
  }
});
