<script setup lang="ts">
definePageMeta({
    middleware: "auth",
});

const { orgId } = useAuth();
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

// Tab configuration
const tabs = [
    { id: "general", label: "General" },
    { id: "members", label: "Members" },
];

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
        await updateMemberRole(
            clerkUserId,
            newRole as "org:admin" | "org:member",
        );
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
function getInitials(
    firstName: string | null,
    lastName: string | null,
    email: string,
): string {
    if (firstName && lastName && firstName.length > 0 && lastName.length > 0) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName && firstName.length > 0) {
        return firstName.charAt(0).toUpperCase();
    }
    return email.length > 0 ? email.charAt(0).toUpperCase() : "?";
}
</script>

<template>
    <div class="max-w-4xl">
        <div class="mb-6">
            <h1 class="text-2xl font-semibold text-neutral-900 tracking-tight">
                Team
            </h1>
        </div>

        <!-- No Organization - Show Create UI -->
        <template v-if="!orgId">
            <UiCard class="mb-6">
                <h2 class="font-semibold text-neutral-900 mb-2">
                    Create a Team
                </h2>
                <p class="text-neutral-600 mb-4">
                    Create a team to invite colleagues and collaborate on
                    feature requests. All team members will have full access to
                    your products.
                </p>
                <CreateOrganization
                    :after-create-organization-url="'/post-auth-redirect'"
                />
            </UiCard>
        </template>

        <!-- Has Organization - Custom Management UI -->
        <template v-else>
            <UiCard>
                <!-- Horizontal Tabs -->
                <UiTabs v-model="activeTab" :tabs="tabs" />

                <!-- Tab Content -->
                <div class="mt-6">
                    <!-- General Tab -->
                    <div v-if="activeTab === 'general'">
                        <!-- Organization Profile -->
                        <UiSettingsRow label="Organization Profile">
                            <div class="flex items-center gap-3">
                                <UiAvatar
                                    :src="organization?.imageUrl"
                                    :initials="
                                        organization?.name?.[0]?.toUpperCase() ||
                                        'O'
                                    "
                                    :alt="organization?.name"
                                    size="md"
                                    rounded="lg"
                                />
                                <span class="font-medium text-neutral-900">
                                    {{ organization?.name }}
                                </span>
                            </div>
                            <template #action>
                                <UiButton
                                    v-if="isAdmin"
                                    variant="ghost"
                                    size="sm"
                                    @click="openUpdateProfile"
                                >
                                    Update profile
                                </UiButton>
                            </template>
                        </UiSettingsRow>

                        <!-- Leave Organization -->
                        <UiSettingsRow label="Leave organization">
                            <div></div>
                            <template #action>
                                <button
                                    class="text-sm text-red-600 hover:text-red-700 font-medium"
                                    @click="showLeaveModal = true"
                                >
                                    Leave organization
                                </button>
                            </template>
                        </UiSettingsRow>

                        <!-- Delete Organization (Admin only) -->
                        <UiSettingsRow
                            v-if="isAdmin"
                            label="Delete organization"
                            :no-border="true"
                        >
                            <div></div>
                            <template #action>
                                <button
                                    class="text-sm text-red-600 hover:text-red-700 font-medium"
                                    @click="showDeleteModal = true"
                                >
                                    Delete organization
                                </button>
                            </template>
                        </UiSettingsRow>
                    </div>

                    <!-- Members Tab -->
                    <div v-else-if="activeTab === 'members'">
                        <div class="flex items-center justify-between mb-6">
                            <div></div>
                            <UiButton
                                v-if="isAdmin"
                                size="sm"
                                @click="openInviteModal"
                            >
                                Invite member
                            </UiButton>
                        </div>

                        <!-- Loading State -->
                        <div v-if="loading" class="flex justify-center py-8">
                            <UiSpinner size="lg" />
                        </div>

                        <!-- Members List -->
                        <div v-else class="space-y-0">
                            <div
                                v-for="member in members"
                                :key="member.id"
                                class="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                            >
                                <div class="flex items-center gap-3">
                                    <UiAvatar
                                        :src="member.imageUrl"
                                        :initials="
                                            getInitials(
                                                member.firstName,
                                                member.lastName,
                                                member.email,
                                            )
                                        "
                                        :alt="member.email"
                                        size="sm"
                                    />
                                    <div>
                                        <div
                                            class="text-sm font-medium text-neutral-900"
                                        >
                                            {{
                                                member.firstName &&
                                                member.lastName
                                                    ? `${member.firstName} ${member.lastName}`
                                                    : member.email
                                            }}
                                        </div>
                                        <div
                                            v-if="
                                                member.firstName ||
                                                member.lastName
                                            "
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
                                        @update:model-value="
                                            handleRoleChange(
                                                member.clerkUserId,
                                                $event,
                                            )
                                        "
                                    />
                                    <UiBadge v-else>{{
                                        getRoleLabel(member.role)
                                    }}</UiBadge>
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
                                <h3
                                    class="text-sm font-medium text-neutral-700 mb-3"
                                >
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
                                                class="w-8 h-8 rounded-full bg-neutral-50 border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-sm shrink-0"
                                            >
                                                {{
                                                    invitation.emailAddress?.charAt(0)?.toUpperCase() || "?"
                                                }}
                                            </div>
                                            <div>
                                                <div
                                                    class="text-sm text-neutral-600"
                                                >
                                                    {{
                                                        invitation.emailAddress
                                                    }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <UiBadge variant="warning" size="sm"
                                                >Pending</UiBadge
                                            >
                                            <UiButton
                                                v-if="isAdmin"
                                                variant="ghost"
                                                size="sm"
                                                @click="
                                                    handleRevokeInvitation(
                                                        invitation.id,
                                                    )
                                                "
                                            >
                                                Cancel
                                            </UiButton>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Empty State -->
                            <div
                                v-if="
                                    members.length === 0 &&
                                    pendingInvitations.length === 0
                                "
                                class="text-center py-8"
                            >
                                <p class="text-neutral-500">No members yet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </UiCard>
        </template>

        <!-- Update Profile Modal -->
        <UiModal
            :open="showUpdateProfileModal"
            title="Update Organization"
            @close="showUpdateProfileModal = false"
        >
            <div class="space-y-4">
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                    >
                        Organization Name
                    </label>
                    <UiInput
                        v-model="profileForm.name"
                        placeholder="Organization name"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showUpdateProfileModal = false"
                    >
                        Cancel
                    </UiButton>
                    <UiButton
                        :loading="updatingProfile"
                        @click="handleUpdateProfile"
                    >
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
                Are you sure you want to leave this organization? You will lose
                access to all products and data associated with it.
            </p>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showLeaveModal = false"
                    >
                        Cancel
                    </UiButton>
                    <UiButton
                        variant="danger"
                        :loading="leaving"
                        @click="handleLeaveOrganization"
                    >
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
                Are you sure you want to delete this organization? This action
                cannot be undone and all data will be permanently lost.
            </p>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showDeleteModal = false"
                    >
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
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                    >
                        Email Address
                    </label>
                    <UiInput
                        v-model="inviteForm.email"
                        type="email"
                        placeholder="colleague@example.com"
                    />
                </div>
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >Role</label
                    >
                    <UiSelect v-model="inviteForm.role" :options="roleOptions" />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showInviteModal = false"
                    >
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
                <span class="font-medium">{{ memberToRemove?.email }}</span>
                from this organization?
            </p>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showRemoveMemberModal = false"
                    >
                        Cancel
                    </UiButton>
                    <UiButton
                        variant="danger"
                        :loading="removing"
                        @click="handleRemoveMember"
                    >
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
