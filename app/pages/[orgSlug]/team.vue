<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { orgId, orgRole } = useAuth();
const router = useRouter();

const {
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
} = useTeamManagement();

// Fetch organization data
const { data: orgData } = await useFetch("/api/organizations/current");
const organization = computed(() => orgData.value?.data?.organization);

// Tab state
const activeTab = ref<"general" | "members">("general");

// Modal states
const showLeaveModal = ref(false);
const showDeleteModal = ref(false);
const showInviteModal = ref(false);
const showRemoveMemberModal = ref(false);
const showUpdateProfileModal = ref(false);

// Form states
const inviteForm = reactive({
  email: "",
  role: "org:member" as "org:admin" | "org:member",
});
const memberToRemove = ref<{ id: string; email: string } | null>(null);
const profileForm = reactive({
  name: "",
});

// Action states
const leaving = ref(false);
const deleting = ref(false);
const inviting = ref(false);
const removing = ref(false);
const updatingProfile = ref(false);

// Fetch members on mount
onMounted(() => {
  if (orgId.value) {
    fetchMembers();
  }
});

// Watch for org changes
watch(orgId, (newOrgId) => {
  if (newOrgId) {
    fetchMembers();
  }
});

// Role options for select
const roleOptions = [
  { value: "org:member", label: "Member" },
  { value: "org:admin", label: "Admin" },
];

function getRoleLabel(role: string) {
  return role === "org:admin" ? "Admin" : "Member";
}

function openUpdateProfile() {
  profileForm.name = organization.value?.name || "";
  showUpdateProfileModal.value = true;
}

async function handleUpdateProfile() {
  if (!profileForm.name.trim()) return;

  updatingProfile.value = true;
  try {
    await updateProfile(profileForm.name.trim());
    // Refresh org data
    await refreshNuxtData("organization-current");
    showUpdateProfileModal.value = false;
  } catch (err) {
    // Error handled in composable
  } finally {
    updatingProfile.value = false;
  }
}

async function handleLeaveOrganization() {
  leaving.value = true;
  try {
    await leaveOrganization();
    // Redirect to onboarding to create/join a new org
    router.push("/onboarding/create-organization");
  } catch (err) {
    // Error handled in composable
  } finally {
    leaving.value = false;
    showLeaveModal.value = false;
  }
}

async function handleDeleteOrganization() {
  deleting.value = true;
  try {
    await deleteOrganization();
    // Redirect to onboarding
    router.push("/onboarding/create-organization");
  } catch (err) {
    // Error handled in composable
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
}

function openInviteModal() {
  inviteForm.email = "";
  inviteForm.role = "org:member";
  showInviteModal.value = true;
}

async function handleInvite() {
  if (!inviteForm.email.trim()) return;

  inviting.value = true;
  try {
    await inviteMember(inviteForm.email.trim(), inviteForm.role);
    showInviteModal.value = false;
  } catch (err) {
    // Error handled in composable
  } finally {
    inviting.value = false;
  }
}

function openRemoveMemberModal(member: { clerkUserId: string; email: string }) {
  memberToRemove.value = { id: member.clerkUserId, email: member.email };
  showRemoveMemberModal.value = true;
}

async function handleRemoveMember() {
  if (!memberToRemove.value) return;

  removing.value = true;
  try {
    await removeMember(memberToRemove.value.id);
    showRemoveMemberModal.value = false;
    memberToRemove.value = null;
  } catch (err) {
    // Error handled in composable
  } finally {
    removing.value = false;
  }
}

async function handleRoleChange(clerkUserId: string, newRole: string) {
  try {
    await updateMemberRole(clerkUserId, newRole as "org:admin" | "org:member");
  } catch (err) {
    // Error handled in composable
  }
}

async function handleRevokeInvitation(invitationId: string) {
  try {
    await revokeInvitation(invitationId);
  } catch (err) {
    // Error handled in composable
  }
}

// Get initials for avatar fallback
function getInitials(firstName: string | null, lastName: string | null, email: string) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  return email[0].toUpperCase();
}
</script>

<template>
  <div class="max-w-4xl">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-neutral-900 tracking-tight">Team</h1>
    </div>

    <!-- No Organization - Show Create UI -->
    <template v-if="!orgId">
      <UiCard class="mb-6">
        <h2 class="font-semibold text-neutral-900 mb-2">Create a Team</h2>
        <p class="text-neutral-600 mb-4">
          Create a team to invite colleagues and collaborate on feature requests.
          All team members will have full access to your products.
        </p>
        <CreateOrganization :after-create-organization-url="'/post-auth-redirect'" />
      </UiCard>
    </template>

    <!-- Has Organization - Custom Management UI -->
    <template v-else>
      <div class="flex gap-6">
        <!-- Sidebar / Tabs -->
        <div class="w-48 shrink-0">
          <nav class="space-y-1">
            <button
              @click="activeTab = 'general'"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === 'general'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              General
            </button>
            <button
              @click="activeTab = 'members'"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === 'members'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              Members
            </button>
          </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1">
          <UiCard>
            <!-- General Tab -->
            <div v-if="activeTab === 'general'">
              <h2 class="text-lg font-semibold text-neutral-900 mb-6">General</h2>

              <!-- Organization Profile -->
              <div class="py-4 border-b border-neutral-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-neutral-500 w-40">
                      Organization Profile
                    </span>
                    <div class="flex items-center gap-3">
                      <div
                        v-if="organization?.imageUrl"
                        class="w-10 h-10 rounded-lg overflow-hidden"
                      >
                        <img
                          :src="organization.imageUrl"
                          :alt="organization.name"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        v-else
                        class="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 font-medium"
                      >
                        {{ organization?.name?.[0]?.toUpperCase() || "O" }}
                      </div>
                      <span class="font-medium text-neutral-900">
                        {{ organization?.name }}
                      </span>
                    </div>
                  </div>
                  <UiButton
                    v-if="isAdmin"
                    variant="ghost"
                    size="sm"
                    @click="openUpdateProfile"
                  >
                    Update profile
                  </UiButton>
                </div>
              </div>

              <!-- Leave Organization -->
              <div class="py-4 border-b border-neutral-100">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-neutral-500 w-40">
                    Leave organization
                  </span>
                  <button
                    class="text-sm text-red-600 hover:text-red-700 font-medium"
                    @click="showLeaveModal = true"
                  >
                    Leave organization
                  </button>
                </div>
              </div>

              <!-- Delete Organization (Admin only) -->
              <div v-if="isAdmin" class="py-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-neutral-500 w-40">
                    Delete organization
                  </span>
                  <button
                    class="text-sm text-red-600 hover:text-red-700 font-medium"
                    @click="showDeleteModal = true"
                  >
                    Delete organization
                  </button>
                </div>
              </div>
            </div>

            <!-- Members Tab -->
            <div v-else-if="activeTab === 'members'">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold text-neutral-900">Members</h2>
                <UiButton v-if="isAdmin" size="sm" @click="openInviteModal">
                  Invite member
                </UiButton>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="flex justify-center py-8">
                <UiSpinner size="lg" />
              </div>

              <!-- Members List -->
              <div v-else class="space-y-3">
                <div
                  v-for="member in members"
                  :key="member.id"
                  class="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                >
                  <div class="flex items-center gap-3">
                    <div
                      v-if="member.imageUrl"
                      class="w-9 h-9 rounded-full overflow-hidden"
                    >
                      <img
                        :src="member.imageUrl"
                        :alt="member.email"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      v-else
                      class="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-sm font-medium"
                    >
                      {{ getInitials(member.firstName, member.lastName, member.email) }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-neutral-900">
                        {{
                          member.firstName && member.lastName
                            ? `${member.firstName} ${member.lastName}`
                            : member.email
                        }}
                      </div>
                      <div
                        v-if="member.firstName || member.lastName"
                        class="text-xs text-neutral-500"
                      >
                        {{ member.email }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <UiSelect
                      v-if="isAdmin"
                      :model-value="member.role"
                      :options="roleOptions"
                      class="w-28"
                      @update:model-value="handleRoleChange(member.clerkUserId, $event)"
                    />
                    <UiBadge v-else>{{ getRoleLabel(member.role) }}</UiBadge>
                    <UiButton
                      v-if="isAdmin"
                      variant="ghost"
                      size="sm"
                      @click="openRemoveMemberModal(member)"
                    >
                      Remove
                    </UiButton>
                  </div>
                </div>

                <!-- Pending Invitations -->
                <div
                  v-if="pendingInvitations.length > 0"
                  class="mt-6 pt-6 border-t border-neutral-200"
                >
                  <h3 class="text-sm font-medium text-neutral-700 mb-3">
                    Pending Invitations
                  </h3>
                  <div class="space-y-2">
                    <div
                      v-for="invitation in pendingInvitations"
                      :key="invitation.id"
                      class="flex items-center justify-between py-2"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="w-9 h-9 rounded-full bg-neutral-50 border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-sm"
                        >
                          {{ invitation.emailAddress[0].toUpperCase() }}
                        </div>
                        <div>
                          <div class="text-sm text-neutral-600">
                            {{ invitation.emailAddress }}
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <UiBadge variant="warning" size="sm">Pending</UiBadge>
                        <UiButton
                          v-if="isAdmin"
                          variant="ghost"
                          size="sm"
                          @click="handleRevokeInvitation(invitation.id)"
                        >
                          Cancel
                        </UiButton>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div
                  v-if="members.length === 0 && pendingInvitations.length === 0"
                  class="text-center py-8"
                >
                  <p class="text-neutral-500">No members yet</p>
                </div>
              </div>
            </div>
          </UiCard>
        </div>
      </div>
    </template>

    <!-- Update Profile Modal -->
    <UiModal
      :open="showUpdateProfileModal"
      title="Update Organization"
      @close="showUpdateProfileModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Organization Name
          </label>
          <UiInput v-model="profileForm.name" placeholder="Organization name" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showUpdateProfileModal = false">
            Cancel
          </UiButton>
          <UiButton :loading="updatingProfile" @click="handleUpdateProfile">
            Save
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Leave Organization Modal -->
    <UiModal
      :open="showLeaveModal"
      title="Leave Organization"
      @close="showLeaveModal = false"
    >
      <p class="text-neutral-600">
        Are you sure you want to leave this organization? You will lose access to
        all products and data associated with it.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showLeaveModal = false">
            Cancel
          </UiButton>
          <UiButton variant="danger" :loading="leaving" @click="handleLeaveOrganization">
            Leave
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Delete Organization Modal -->
    <UiModal
      :open="showDeleteModal"
      title="Delete Organization"
      @close="showDeleteModal = false"
    >
      <p class="text-neutral-600">
        Are you sure you want to delete this organization? This action cannot be
        undone and all data will be permanently lost.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showDeleteModal = false">
            Cancel
          </UiButton>
          <UiButton
            variant="danger"
            :loading="deleting"
            @click="handleDeleteOrganization"
          >
            Delete
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Invite Member Modal -->
    <UiModal
      :open="showInviteModal"
      title="Invite Member"
      @close="showInviteModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Email Address
          </label>
          <UiInput
            v-model="inviteForm.email"
            type="email"
            placeholder="colleague@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Role</label>
          <UiSelect v-model="inviteForm.role" :options="roleOptions" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showInviteModal = false">
            Cancel
          </UiButton>
          <UiButton :loading="inviting" @click="handleInvite">
            Send Invite
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Remove Member Modal -->
    <UiModal
      :open="showRemoveMemberModal"
      title="Remove Member"
      @close="showRemoveMemberModal = false"
    >
      <p class="text-neutral-600">
        Are you sure you want to remove
        <span class="font-medium">{{ memberToRemove?.email }}</span> from this
        organization?
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showRemoveMemberModal = false">
            Cancel
          </UiButton>
          <UiButton variant="danger" :loading="removing" @click="handleRemoveMember">
            Remove
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Error Display -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg"
    >
      {{ error }}
    </div>
  </div>
</template>
