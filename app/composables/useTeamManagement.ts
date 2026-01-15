import type {
  OrganizationMember,
  PendingInvitation,
} from "~~/server/api/organizations/members.get";

interface OrganizationProfile {
  id: string;
  name: string;
  slug: string | null;
  imageUrl: string | null;
}

export function useTeamManagement() {
  const members = ref<OrganizationMember[]>([]);
  const pendingInvitations = ref<PendingInvitation[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { orgId, orgRole } = useAuth();

  const isAdmin = computed(() => orgRole.value === "org:admin");

  async function fetchMembers() {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        data: {
          members: OrganizationMember[];
          pendingInvitations: PendingInvitation[];
        };
      }>("/api/organizations/members");

      members.value = response.data.members;
      pendingInvitations.value = response.data.pendingInvitations;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to fetch members";
      console.error("Failed to fetch members:", err);
    } finally {
      loading.value = false;
    }
  }

  async function inviteMember(
    emailAddress: string,
    role: "org:admin" | "org:member" = "org:member"
  ) {
    try {
      const response = await $fetch<{ data: PendingInvitation }>(
        "/api/organizations/members/invite",
        {
          method: "POST",
          body: { emailAddress, role },
        }
      );

      pendingInvitations.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to invite member";
      throw err;
    }
  }

  async function removeMember(clerkUserId: string) {
    try {
      await $fetch(`/api/organizations/members/${clerkUserId}`, {
        method: "DELETE",
      });

      members.value = members.value.filter((m) => m.clerkUserId !== clerkUserId);
      return true;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to remove member";
      throw err;
    }
  }

  async function updateMemberRole(
    clerkUserId: string,
    role: "org:admin" | "org:member"
  ) {
    try {
      await $fetch(`/api/organizations/members/${clerkUserId}`, {
        method: "PATCH",
        body: { role },
      });

      const member = members.value.find((m) => m.clerkUserId === clerkUserId);
      if (member) {
        member.role = role;
      }
      return true;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to update member role";
      throw err;
    }
  }

  async function revokeInvitation(invitationId: string) {
    try {
      await $fetch(`/api/organizations/invitations/${invitationId}`, {
        method: "DELETE",
      });

      pendingInvitations.value = pendingInvitations.value.filter(
        (inv) => inv.id !== invitationId
      );
      return true;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to revoke invitation";
      throw err;
    }
  }

  async function leaveOrganization() {
    try {
      await $fetch("/api/organizations/leave", {
        method: "POST",
      });

      return true;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to leave organization";
      throw err;
    }
  }

  async function deleteOrganization() {
    if (!orgId.value) {
      throw new Error("No active organization");
    }

    try {
      await $fetch(`/api/organizations/${orgId.value}`, {
        method: "DELETE",
      });

      return true;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to delete organization";
      throw err;
    }
  }

  async function updateProfile(name: string) {
    try {
      const response = await $fetch<{ data: OrganizationProfile }>(
        "/api/organizations/profile",
        {
          method: "PATCH",
          body: { name },
        }
      );

      return response.data;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to update organization";
      throw err;
    }
  }

  return {
    members,
    pendingInvitations,
    loading,
    error,
    isAdmin,
    fetchMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    revokeInvitation,
    leaveOrganization,
    deleteOrganization,
    updateProfile,
  };
}
