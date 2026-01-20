<script setup lang="ts">
import type {
    EmailAddressResource,
    ExternalAccountResource,
    SessionWithActivitiesResource,
    TOTPResource,
} from "@clerk/types";

definePageMeta({
    middleware: "auth",
});

const { user } = useUser();
const clerk = useClerk();
const router = useRouter();

// Tab state
const activeTab = ref<"profile" | "security">("profile");

// Modal states
const showUpdateProfileModal = ref(false);
const showAddEmailModal = ref(false);
const showVerifyEmailModal = ref(false);
const showConnectAccountModal = ref(false);
const showChangePasswordModal = ref(false);
const showEnableTotpModal = ref(false);
const showDisableTotpModal = ref(false);
const showBackupCodesModal = ref(false);
const showDeleteAccountModal = ref(false);

// Dropdown states
const openEmailMenuId = ref<string | null>(null);
const openAccountMenuId = ref<string | null>(null);

// Form states
const profileForm = reactive({
    firstName: "",
    lastName: "",
    avatarFile: null as File | null,
    avatarPreview: "",
});
const emailForm = reactive({
    email: "",
    verificationCode: "",
});
const passwordForm = reactive({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
});
const totpForm = reactive({
    code: "",
});
const deleteForm = reactive({
    confirmation: "",
});

// Loading states
const updatingProfile = ref(false);
const uploadingAvatar = ref(false);
const removingAvatar = ref(false);
const addingEmail = ref(false);
const verifyingEmail = ref(false);
const settingPrimaryEmail = ref(false);
const removingEmail = ref(false);
const connectingAccount = ref(false);
const disconnectingAccount = ref(false);
const changingPassword = ref(false);
const enablingTotp = ref(false);
const verifyingTotp = ref(false);
const disablingTotp = ref(false);
const loadingSessions = ref(false);
const revokingSession = ref<string | null>(null);
const deletingAccount = ref(false);

// Data states
const sessions = ref<SessionWithActivitiesResource[]>([]);
const currentSessionId = ref<string | null>(null);
const pendingEmailAddress = ref<EmailAddressResource | null>(null);
const totpResource = ref<TOTPResource | null>(null);
const backupCodes = ref<string[]>([]);
const error = ref<string | null>(null);

// Tab configuration
const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
];

// Get initials for avatar fallback
const initials = computed(() => {
    const first = user.value?.firstName?.[0] || "";
    const last = user.value?.lastName?.[0] || "";
    if (first && last) return `${first}${last}`.toUpperCase();
    if (first) return first.toUpperCase();
    return user.value?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || "?";
});

// Check if user has password enabled
const hasPassword = computed(() => user.value?.passwordEnabled ?? false);

// Check if TOTP is enabled
const hasTotpEnabled = computed(() => user.value?.totpEnabled ?? false);

// Available OAuth providers
const oauthProviders = [
    { strategy: "oauth_google", name: "Google", icon: "google" as const },
    { strategy: "oauth_github", name: "GitHub", icon: "github" as const },
];

// ========== Profile Functions ==========

function openUpdateProfileModal() {
    profileForm.firstName = user.value?.firstName || "";
    profileForm.lastName = user.value?.lastName || "";
    profileForm.avatarFile = null;
    profileForm.avatarPreview = user.value?.imageUrl || "";
    showUpdateProfileModal.value = true;
}

function handleAvatarFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        profileForm.avatarFile = input.files[0];
        profileForm.avatarPreview = URL.createObjectURL(input.files[0]);
    }
}

async function handleRemoveAvatar() {
    if (!user.value) return;
    removingAvatar.value = true;
    try {
        await user.value.setProfileImage({ file: null });
        profileForm.avatarPreview = "";
        profileForm.avatarFile = null;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to remove avatar";
    } finally {
        removingAvatar.value = false;
    }
}

async function handleUpdateProfile() {
    if (!user.value) return;
    updatingProfile.value = true;
    error.value = null;
    try {
        // Upload avatar if changed
        if (profileForm.avatarFile) {
            uploadingAvatar.value = true;
            await user.value.setProfileImage({ file: profileForm.avatarFile });
            uploadingAvatar.value = false;
        }
        // Update name
        await user.value.update({
            firstName: profileForm.firstName,
            lastName: profileForm.lastName,
        });
        showUpdateProfileModal.value = false;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to update profile";
    } finally {
        updatingProfile.value = false;
        uploadingAvatar.value = false;
    }
}

// ========== Email Functions ==========

function openAddEmailModal() {
    emailForm.email = "";
    emailForm.verificationCode = "";
    pendingEmailAddress.value = null;
    showAddEmailModal.value = true;
}

async function handleAddEmail() {
    if (!user.value || !emailForm.email.trim()) return;
    addingEmail.value = true;
    error.value = null;
    try {
        const emailAddress = await user.value.createEmailAddress({
            email: emailForm.email.trim(),
        });
        await emailAddress.prepareVerification({ strategy: "email_code" });
        pendingEmailAddress.value = emailAddress;
        showAddEmailModal.value = false;
        showVerifyEmailModal.value = true;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to add email address";
    } finally {
        addingEmail.value = false;
    }
}

async function handleVerifyEmail() {
    if (!pendingEmailAddress.value || !emailForm.verificationCode.trim())
        return;
    verifyingEmail.value = true;
    error.value = null;
    try {
        await pendingEmailAddress.value.attemptVerification({
            code: emailForm.verificationCode.trim(),
        });
        showVerifyEmailModal.value = false;
        pendingEmailAddress.value = null;
        emailForm.verificationCode = "";
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Invalid verification code";
    } finally {
        verifyingEmail.value = false;
    }
}

async function handleSetPrimaryEmail(emailId: string) {
    if (!user.value) return;
    settingPrimaryEmail.value = true;
    error.value = null;
    try {
        await user.value.update({ primaryEmailAddressId: emailId });
        openEmailMenuId.value = null;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to set primary email";
    } finally {
        settingPrimaryEmail.value = false;
    }
}

async function handleRemoveEmail(emailAddress: EmailAddressResource) {
    removingEmail.value = true;
    error.value = null;
    try {
        await emailAddress.destroy();
        openEmailMenuId.value = null;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to remove email";
    } finally {
        removingEmail.value = false;
    }
}

// ========== Connected Accounts Functions ==========

async function handleConnectAccount(strategy: string) {
    if (!user.value) return;
    connectingAccount.value = true;
    error.value = null;
    showConnectAccountModal.value = false;
    try {
        const redirectUrl = window.location.href;
        const externalAccount = await user.value.createExternalAccount({
            strategy: strategy as any,
            redirectUrl,
        });
        // Redirect to OAuth provider
        if (externalAccount.verification?.externalVerificationRedirectURL) {
            window.location.href =
                externalAccount.verification.externalVerificationRedirectURL.href;
        }
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to connect account";
        connectingAccount.value = false;
    }
}

async function handleDisconnectAccount(account: ExternalAccountResource) {
    disconnectingAccount.value = true;
    error.value = null;
    try {
        await account.destroy();
        openAccountMenuId.value = null;
    } catch (err: any) {
        error.value =
            err.errors?.[0]?.message || "Failed to disconnect account";
    } finally {
        disconnectingAccount.value = false;
    }
}

// ========== Password Functions ==========

function openChangePasswordModal() {
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
    showChangePasswordModal.value = true;
}

async function handleChangePassword() {
    if (!user.value) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        error.value = "Passwords do not match";
        return;
    }
    changingPassword.value = true;
    error.value = null;
    try {
        await user.value.updatePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
        });
        showChangePasswordModal.value = false;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to change password";
    } finally {
        changingPassword.value = false;
    }
}

// ========== TOTP Functions ==========

async function openEnableTotpModal() {
    if (!user.value) return;
    enablingTotp.value = true;
    error.value = null;
    totpForm.code = "";
    try {
        totpResource.value = await user.value.createTOTP();
        showEnableTotpModal.value = true;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to setup 2FA";
    } finally {
        enablingTotp.value = false;
    }
}

async function handleVerifyTotp() {
    if (!user.value || !totpForm.code.trim()) return;
    verifyingTotp.value = true;
    error.value = null;
    try {
        const result = await user.value.verifyTOTP({
            code: totpForm.code.trim(),
        });
        backupCodes.value = result.backupCodes || [];
        showEnableTotpModal.value = false;
        if (backupCodes.value.length > 0) {
            showBackupCodesModal.value = true;
        }
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Invalid verification code";
    } finally {
        verifyingTotp.value = false;
    }
}

async function handleDisableTotp() {
    if (!user.value) return;
    disablingTotp.value = true;
    error.value = null;
    try {
        await user.value.disableTOTP();
        showDisableTotpModal.value = false;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to disable 2FA";
    } finally {
        disablingTotp.value = false;
    }
}

// ========== Sessions Functions ==========

async function fetchSessions() {
    if (!user.value) return;
    loadingSessions.value = true;
    try {
        sessions.value = await user.value.getSessions();
        currentSessionId.value = clerk.value?.session?.id || null;
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to load sessions";
    } finally {
        loadingSessions.value = false;
    }
}

async function handleRevokeSession(session: SessionWithActivitiesResource) {
    revokingSession.value = session.id;
    error.value = null;
    try {
        await session.revoke();
        sessions.value = sessions.value.filter((s) => s.id !== session.id);
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to sign out session";
    } finally {
        revokingSession.value = null;
    }
}

// ========== Delete Account Functions ==========

function openDeleteAccountModal() {
    deleteForm.confirmation = "";
    showDeleteAccountModal.value = true;
}

async function handleDeleteAccount() {
    if (!user.value || deleteForm.confirmation !== "DELETE") return;
    deletingAccount.value = true;
    error.value = null;
    try {
        await user.value.delete();
        router.push("/");
    } catch (err: any) {
        error.value = err.errors?.[0]?.message || "Failed to delete account";
    } finally {
        deletingAccount.value = false;
    }
}

// ========== Menu Functions ==========

function toggleEmailMenu(emailId: string) {
    openEmailMenuId.value = openEmailMenuId.value === emailId ? null : emailId;
}

function toggleAccountMenu(accountId: string) {
    openAccountMenuId.value =
        openAccountMenuId.value === accountId ? null : accountId;
}

function closeAllMenus() {
    openEmailMenuId.value = null;
    openAccountMenuId.value = null;
}

// Close menus on click outside
function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest("[data-menu]")) {
        closeAllMenus();
    }
}

// Load sessions when security tab is active
watch(activeTab, (newTab) => {
    if (newTab === "security" && sessions.value.length === 0) {
        fetchSessions();
    }
});

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});

// Clear error after 5 seconds
watch(error, (newError) => {
    if (newError) {
        setTimeout(() => {
            error.value = null;
        }, 5000);
    }
});
</script>

<template>
    <div class="max-w-4xl">
        <div class="mb-6">
            <h1 class="text-2xl font-semibold text-neutral-900 tracking-tight">
                Profile
            </h1>
        </div>

        <div v-if="user">
            <UiCard>
                <!-- Horizontal Tabs -->
                <UiTabs v-model="activeTab" :tabs="tabs" />

                <!-- Tab Content -->
                <div class="mt-6">
                    <!-- Profile Tab -->
                    <ProfileTabContent
                        v-if="activeTab === 'profile'"
                        :user="user"
                        :initials="initials"
                        :open-email-menu-id="openEmailMenuId"
                        :open-account-menu-id="openAccountMenuId"
                        :setting-primary-email="settingPrimaryEmail"
                        :removing-email="removingEmail"
                        :disconnecting-account="disconnectingAccount"
                        @update-profile="openUpdateProfileModal"
                        @add-email="openAddEmailModal"
                        @toggle-email-menu="toggleEmailMenu"
                        @set-primary-email="handleSetPrimaryEmail"
                        @remove-email="handleRemoveEmail"
                        @connect-account="showConnectAccountModal = true"
                        @toggle-account-menu="toggleAccountMenu"
                        @disconnect-account="handleDisconnectAccount"
                    />

                    <!-- Security Tab -->
                    <ProfileSecurityContent
                        v-else-if="activeTab === 'security'"
                        :has-password="hasPassword"
                        :has-totp-enabled="hasTotpEnabled"
                        :sessions="sessions"
                        :current-session-id="currentSessionId"
                        :loading-sessions="loadingSessions"
                        :revoking-session="revokingSession"
                        :enabling-totp="enablingTotp"
                        @change-password="openChangePasswordModal"
                        @enable-totp="openEnableTotpModal"
                        @disable-totp="showDisableTotpModal = true"
                        @revoke-session="handleRevokeSession"
                        @delete-account="openDeleteAccountModal"
                    />
                </div>
            </UiCard>
        </div>

        <div v-else class="flex justify-center py-8">
            <UiSpinner size="lg" />
        </div>

        <!-- Update Profile Modal -->
        <UiModal
            :open="showUpdateProfileModal"
            title="Update Profile"
            @close="showUpdateProfileModal = false"
        >
            <div class="space-y-4">
                <!-- Avatar -->
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-2"
                        >Avatar</label
                    >
                    <div class="flex items-center gap-4">
                        <UiAvatar
                            :src="profileForm.avatarPreview"
                            :initials="initials"
                            alt="Avatar preview"
                            size="lg"
                        />
                        <div class="flex gap-2">
                            <label class="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="handleAvatarFileSelect"
                                />
                                <span
                                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    Upload
                                </span>
                            </label>
                            <UiButton
                                v-if="user?.imageUrl"
                                variant="ghost"
                                size="sm"
                                :loading="removingAvatar"
                                @click="handleRemoveAvatar"
                            >
                                Remove
                            </UiButton>
                        </div>
                    </div>
                </div>
                <!-- First Name -->
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >First name</label
                    >
                    <UiInput
                        v-model="profileForm.firstName"
                        placeholder="First name"
                    />
                </div>
                <!-- Last Name -->
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >Last name</label
                    >
                    <UiInput
                        v-model="profileForm.lastName"
                        placeholder="Last name"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showUpdateProfileModal = false"
                        >Cancel</UiButton
                    >
                    <UiButton
                        :loading="updatingProfile"
                        @click="handleUpdateProfile"
                        >Save</UiButton
                    >
                </div>
            </template>
        </UiModal>

        <!-- Add Email Modal -->
        <UiModal
            :open="showAddEmailModal"
            title="Add Email Address"
            @close="showAddEmailModal = false"
        >
            <div class="space-y-4">
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >Email address</label
                    >
                    <UiInput
                        v-model="emailForm.email"
                        type="email"
                        placeholder="you@example.com"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showAddEmailModal = false"
                        >Cancel</UiButton
                    >
                    <UiButton :loading="addingEmail" @click="handleAddEmail"
                        >Add email</UiButton
                    >
                </div>
            </template>
        </UiModal>

        <!-- Verify Email Modal -->
        <UiModal
            :open="showVerifyEmailModal"
            title="Verify Email Address"
            @close="showVerifyEmailModal = false"
        >
            <div class="space-y-4">
                <p class="text-sm text-neutral-600">
                    We've sent a verification code to
                    <span class="font-medium">{{
                        pendingEmailAddress?.emailAddress
                    }}</span
                    >. Enter the code below to verify this email address.
                </p>
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >Verification code</label
                    >
                    <UiInput
                        v-model="emailForm.verificationCode"
                        placeholder="Enter code"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showVerifyEmailModal = false"
                        >Cancel</UiButton
                    >
                    <UiButton
                        :loading="verifyingEmail"
                        @click="handleVerifyEmail"
                        >Verify</UiButton
                    >
                </div>
            </template>
        </UiModal>

        <!-- Connect Account Modal -->
        <UiModal
            :open="showConnectAccountModal"
            title="Connect Account"
            @close="showConnectAccountModal = false"
        >
            <div class="space-y-2">
                <p class="text-sm text-neutral-600 mb-4">
                    Connect a social account to enable single sign-on.
                </p>
                <button
                    v-for="provider in oauthProviders"
                    :key="provider.strategy"
                    @click="handleConnectAccount(provider.strategy)"
                    :disabled="connectingAccount"
                    class="w-full flex items-center gap-3 px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                    <div class="w-6 h-6 flex items-center justify-center">
                        <IconsOAuthIcon :provider="provider.icon" />
                    </div>
                    <span class="text-sm font-medium text-neutral-700">{{
                        provider.name
                    }}</span>
                </button>
            </div>
            <template #footer>
                <div class="flex justify-end">
                    <UiButton
                        variant="secondary"
                        @click="showConnectAccountModal = false"
                        >Cancel</UiButton
                    >
                </div>
            </template>
        </UiModal>

        <!-- Change Password Modal -->
        <UiModal
            :open="showChangePasswordModal"
            title="Change Password"
            @close="showChangePasswordModal = false"
        >
            <div class="space-y-4">
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >Current password</label
                    >
                    <UiInput
                        v-model="passwordForm.currentPassword"
                        type="password"
                        placeholder="Enter current password"
                    />
                </div>
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >New password</label
                    >
                    <UiInput
                        v-model="passwordForm.newPassword"
                        type="password"
                        placeholder="Enter new password"
                    />
                </div>
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >Confirm new password</label
                    >
                    <UiInput
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showChangePasswordModal = false"
                        >Cancel</UiButton
                    >
                    <UiButton
                        :loading="changingPassword"
                        @click="handleChangePassword"
                        >Change password</UiButton
                    >
                </div>
            </template>
        </UiModal>

        <!-- Enable TOTP Modal -->
        <UiModal
            :open="showEnableTotpModal"
            title="Enable Two-Factor Authentication"
            @close="showEnableTotpModal = false"
        >
            <div class="space-y-4">
                <p class="text-sm text-neutral-600">
                    Scan this QR code with your authenticator app (like Google
                    Authenticator, Authy, or 1Password), then enter the
                    verification code below.
                </p>
                <div v-if="totpResource?.uri" class="flex justify-center py-4">
                    <img
                        :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpResource.uri)}`"
                        alt="TOTP QR Code"
                        class="w-48 h-48"
                    />
                </div>
                <div v-if="totpResource?.secret" class="text-center">
                    <p class="text-xs text-neutral-500 mb-1">
                        Or enter this code manually:
                    </p>
                    <code
                        class="text-sm bg-neutral-100 px-3 py-1 rounded font-mono"
                        >{{ totpResource.secret }}</code
                    >
                </div>
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >Verification code</label
                    >
                    <UiInput
                        v-model="totpForm.code"
                        placeholder="Enter 6-digit code"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showEnableTotpModal = false"
                        >Cancel</UiButton
                    >
                    <UiButton :loading="verifyingTotp" @click="handleVerifyTotp"
                        >Verify and enable</UiButton
                    >
                </div>
            </template>
        </UiModal>

        <!-- Backup Codes Modal -->
        <UiModal
            :open="showBackupCodesModal"
            title="Backup Codes"
            :close-on-backdrop="false"
            @close="showBackupCodesModal = false"
        >
            <div class="space-y-4">
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="text-sm text-amber-800">
                        Save these backup codes in a secure place. You can use
                        them to sign in if you lose access to your authenticator
                        app.
                    </p>
                </div>
                <div
                    class="grid grid-cols-2 gap-2 p-4 bg-neutral-50 rounded-lg"
                >
                    <code
                        v-for="code in backupCodes"
                        :key="code"
                        class="text-sm font-mono text-neutral-700"
                    >
                        {{ code }}
                    </code>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end">
                    <UiButton @click="showBackupCodesModal = false"
                        >Done</UiButton
                    >
                </div>
            </template>
        </UiModal>

        <!-- Disable TOTP Modal -->
        <UiModal
            :open="showDisableTotpModal"
            title="Disable Two-Factor Authentication"
            @close="showDisableTotpModal = false"
        >
            <p class="text-neutral-600">
                Are you sure you want to disable two-factor authentication? Your
                account will be less secure without it.
            </p>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showDisableTotpModal = false"
                        >Cancel</UiButton
                    >
                    <UiButton
                        variant="danger"
                        :loading="disablingTotp"
                        @click="handleDisableTotp"
                        >Disable</UiButton
                    >
                </div>
            </template>
        </UiModal>

        <!-- Delete Account Modal -->
        <UiModal
            :open="showDeleteAccountModal"
            title="Delete Account"
            @close="showDeleteAccountModal = false"
        >
            <div class="space-y-4">
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-800">
                        This action is permanent and cannot be undone. All your
                        data will be permanently deleted, including your
                        profile, settings, and any associated content.
                    </p>
                </div>
                <div>
                    <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                    >
                        Type
                        <span class="font-mono bg-neutral-100 px-1"
                            >DELETE</span
                        >
                        to confirm
                    </label>
                    <UiInput
                        v-model="deleteForm.confirmation"
                        placeholder="DELETE"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UiButton
                        variant="secondary"
                        @click="showDeleteAccountModal = false"
                        >Cancel</UiButton
                    >
                    <UiButton
                        variant="danger"
                        :loading="deletingAccount"
                        :disabled="deleteForm.confirmation !== 'DELETE'"
                        @click="handleDeleteAccount"
                    >
                        Delete account
                    </UiButton>
                </div>
            </template>
        </UiModal>

        <!-- Error Toast -->
        <div
            v-if="error"
            class="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg"
        >
            {{ error }}
        </div>
    </div>
</template>
