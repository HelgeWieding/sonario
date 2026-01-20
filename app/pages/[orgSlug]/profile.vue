<script setup lang="ts">
import type { EmailAddressResource, ExternalAccountResource, SessionWithActivitiesResource, TOTPResource } from '@clerk/types'

definePageMeta({
  middleware: 'auth',
})

const { user } = useUser()
const clerk = useClerk()
const router = useRouter()

// Tab state
const activeTab = ref<'profile' | 'security'>('profile')

// Modal states
const showUpdateProfileModal = ref(false)
const showAddEmailModal = ref(false)
const showVerifyEmailModal = ref(false)
const showConnectAccountModal = ref(false)
const showChangePasswordModal = ref(false)
const showEnableTotpModal = ref(false)
const showDisableTotpModal = ref(false)
const showBackupCodesModal = ref(false)
const showDeleteAccountModal = ref(false)

// Dropdown states
const openEmailMenuId = ref<string | null>(null)
const openAccountMenuId = ref<string | null>(null)

// Form states
const profileForm = reactive({
  firstName: '',
  lastName: '',
  avatarFile: null as File | null,
  avatarPreview: '',
})
const emailForm = reactive({
  email: '',
  verificationCode: '',
})
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const totpForm = reactive({
  code: '',
})
const deleteForm = reactive({
  confirmation: '',
})

// Loading states
const updatingProfile = ref(false)
const uploadingAvatar = ref(false)
const removingAvatar = ref(false)
const addingEmail = ref(false)
const verifyingEmail = ref(false)
const settingPrimaryEmail = ref(false)
const removingEmail = ref(false)
const connectingAccount = ref(false)
const disconnectingAccount = ref(false)
const changingPassword = ref(false)
const enablingTotp = ref(false)
const verifyingTotp = ref(false)
const disablingTotp = ref(false)
const loadingSessions = ref(false)
const revokingSession = ref<string | null>(null)
const deletingAccount = ref(false)

// Data states
const sessions = ref<SessionWithActivitiesResource[]>([])
const currentSessionId = ref<string | null>(null)
const pendingEmailAddress = ref<EmailAddressResource | null>(null)
const totpResource = ref<TOTPResource | null>(null)
const backupCodes = ref<string[]>([])
const error = ref<string | null>(null)

// Get initials for avatar fallback
const initials = computed(() => {
  const first = user.value?.firstName?.[0] || ''
  const last = user.value?.lastName?.[0] || ''
  if (first && last) return `${first}${last}`.toUpperCase()
  if (first) return first.toUpperCase()
  return user.value?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || '?'
})

// Get primary email
const primaryEmail = computed(() => {
  return user.value?.emailAddresses.find(e => e.id === user.value?.primaryEmailAddressId)
})

// Check if user has password enabled
const hasPassword = computed(() => user.value?.passwordEnabled ?? false)

// Check if TOTP is enabled
const hasTotpEnabled = computed(() => user.value?.totpEnabled ?? false)

// Available OAuth providers
const oauthProviders = [
  { strategy: 'oauth_google', name: 'Google', icon: 'google' },
  { strategy: 'oauth_github', name: 'GitHub', icon: 'github' },
]

// ========== Profile Functions ==========

function openUpdateProfileModal() {
  profileForm.firstName = user.value?.firstName || ''
  profileForm.lastName = user.value?.lastName || ''
  profileForm.avatarFile = null
  profileForm.avatarPreview = user.value?.imageUrl || ''
  showUpdateProfileModal.value = true
}

function handleAvatarFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    profileForm.avatarFile = input.files[0]
    profileForm.avatarPreview = URL.createObjectURL(input.files[0])
  }
}

async function handleRemoveAvatar() {
  if (!user.value) return
  removingAvatar.value = true
  try {
    await user.value.setProfileImage({ file: null })
    profileForm.avatarPreview = ''
    profileForm.avatarFile = null
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to remove avatar'
  } finally {
    removingAvatar.value = false
  }
}

async function handleUpdateProfile() {
  if (!user.value) return
  updatingProfile.value = true
  error.value = null
  try {
    // Upload avatar if changed
    if (profileForm.avatarFile) {
      uploadingAvatar.value = true
      await user.value.setProfileImage({ file: profileForm.avatarFile })
      uploadingAvatar.value = false
    }
    // Update name
    await user.value.update({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
    })
    showUpdateProfileModal.value = false
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to update profile'
  } finally {
    updatingProfile.value = false
    uploadingAvatar.value = false
  }
}

// ========== Email Functions ==========

function openAddEmailModal() {
  emailForm.email = ''
  emailForm.verificationCode = ''
  pendingEmailAddress.value = null
  showAddEmailModal.value = true
}

async function handleAddEmail() {
  if (!user.value || !emailForm.email.trim()) return
  addingEmail.value = true
  error.value = null
  try {
    const emailAddress = await user.value.createEmailAddress({ email: emailForm.email.trim() })
    await emailAddress.prepareVerification({ strategy: 'email_code' })
    pendingEmailAddress.value = emailAddress
    showAddEmailModal.value = false
    showVerifyEmailModal.value = true
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to add email address'
  } finally {
    addingEmail.value = false
  }
}

async function handleVerifyEmail() {
  if (!pendingEmailAddress.value || !emailForm.verificationCode.trim()) return
  verifyingEmail.value = true
  error.value = null
  try {
    await pendingEmailAddress.value.attemptVerification({ code: emailForm.verificationCode.trim() })
    showVerifyEmailModal.value = false
    pendingEmailAddress.value = null
    emailForm.verificationCode = ''
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Invalid verification code'
  } finally {
    verifyingEmail.value = false
  }
}

async function handleSetPrimaryEmail(emailId: string) {
  if (!user.value) return
  settingPrimaryEmail.value = true
  error.value = null
  try {
    await user.value.update({ primaryEmailAddressId: emailId })
    openEmailMenuId.value = null
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to set primary email'
  } finally {
    settingPrimaryEmail.value = false
  }
}

async function handleRemoveEmail(emailAddress: EmailAddressResource) {
  removingEmail.value = true
  error.value = null
  try {
    await emailAddress.destroy()
    openEmailMenuId.value = null
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to remove email'
  } finally {
    removingEmail.value = false
  }
}

// ========== Connected Accounts Functions ==========

async function handleConnectAccount(strategy: string) {
  if (!user.value) return
  connectingAccount.value = true
  error.value = null
  showConnectAccountModal.value = false
  try {
    const redirectUrl = window.location.href
    const externalAccount = await user.value.createExternalAccount({
      strategy: strategy as any,
      redirectUrl,
    })
    // Redirect to OAuth provider
    if (externalAccount.verification?.externalVerificationRedirectURL) {
      window.location.href = externalAccount.verification.externalVerificationRedirectURL.href
    }
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to connect account'
    connectingAccount.value = false
  }
}

async function handleDisconnectAccount(account: ExternalAccountResource) {
  disconnectingAccount.value = true
  error.value = null
  try {
    await account.destroy()
    openAccountMenuId.value = null
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to disconnect account'
  } finally {
    disconnectingAccount.value = false
  }
}

// ========== Password Functions ==========

function openChangePasswordModal() {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showChangePasswordModal.value = true
}

async function handleChangePassword() {
  if (!user.value) return
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }
  changingPassword.value = true
  error.value = null
  try {
    await user.value.updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    showChangePasswordModal.value = false
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

// ========== TOTP Functions ==========

async function openEnableTotpModal() {
  if (!user.value) return
  enablingTotp.value = true
  error.value = null
  totpForm.code = ''
  try {
    totpResource.value = await user.value.createTOTP()
    showEnableTotpModal.value = true
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to setup 2FA'
  } finally {
    enablingTotp.value = false
  }
}

async function handleVerifyTotp() {
  if (!user.value || !totpForm.code.trim()) return
  verifyingTotp.value = true
  error.value = null
  try {
    const result = await user.value.verifyTOTP({ code: totpForm.code.trim() })
    backupCodes.value = result.backupCodes || []
    showEnableTotpModal.value = false
    if (backupCodes.value.length > 0) {
      showBackupCodesModal.value = true
    }
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Invalid verification code'
  } finally {
    verifyingTotp.value = false
  }
}

async function handleDisableTotp() {
  if (!user.value) return
  disablingTotp.value = true
  error.value = null
  try {
    await user.value.disableTOTP()
    showDisableTotpModal.value = false
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to disable 2FA'
  } finally {
    disablingTotp.value = false
  }
}

// ========== Sessions Functions ==========

async function fetchSessions() {
  if (!user.value) return
  loadingSessions.value = true
  try {
    sessions.value = await user.value.getSessions()
    currentSessionId.value = clerk.value?.session?.id || null
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to load sessions'
  } finally {
    loadingSessions.value = false
  }
}

async function handleRevokeSession(session: SessionWithActivitiesResource) {
  revokingSession.value = session.id
  error.value = null
  try {
    await session.revoke()
    sessions.value = sessions.value.filter(s => s.id !== session.id)
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to sign out session'
  } finally {
    revokingSession.value = null
  }
}

function formatSessionInfo(session: SessionWithActivitiesResource) {
  const activity = session.latestActivity
  if (!activity) {
    return {
      device: 'Unknown device',
      location: 'Unknown location',
      lastActive: new Date(session.lastActiveAt).toLocaleString(),
    }
  }

  const browser = activity.browserName || 'Unknown browser'
  const os = activity.deviceType || ''
  const city = activity.city || ''
  const country = activity.country || ''
  const location = [city, country].filter(Boolean).join(', ')

  return {
    device: [browser, os].filter(Boolean).join(' on '),
    location: location || 'Unknown location',
    lastActive: new Date(session.lastActiveAt).toLocaleString(),
  }
}

// ========== Delete Account Functions ==========

function openDeleteAccountModal() {
  deleteForm.confirmation = ''
  showDeleteAccountModal.value = true
}

async function handleDeleteAccount() {
  if (!user.value || deleteForm.confirmation !== 'DELETE') return
  deletingAccount.value = true
  error.value = null
  try {
    await user.value.delete()
    router.push('/')
  } catch (err: any) {
    error.value = err.errors?.[0]?.message || 'Failed to delete account'
  } finally {
    deletingAccount.value = false
  }
}

// ========== Menu Functions ==========

function toggleEmailMenu(emailId: string) {
  openEmailMenuId.value = openEmailMenuId.value === emailId ? null : emailId
}

function toggleAccountMenu(accountId: string) {
  openAccountMenuId.value = openAccountMenuId.value === accountId ? null : accountId
}

function closeAllMenus() {
  openEmailMenuId.value = null
  openAccountMenuId.value = null
}

// Close menus on click outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('[data-menu]')) {
    closeAllMenus()
  }
}

// Load sessions when security tab is active
watch(activeTab, (newTab) => {
  if (newTab === 'security' && sessions.value.length === 0) {
    fetchSessions()
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Clear error after 5 seconds
watch(error, (newError) => {
  if (newError) {
    setTimeout(() => {
      error.value = null
    }, 5000)
  }
})
</script>

<template>
  <div class="max-w-4xl">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-neutral-900 tracking-tight">Profile</h1>
    </div>

    <div v-if="user" class="flex gap-6">
      <!-- Sidebar / Tabs -->
      <div class="w-48 shrink-0">
        <nav class="space-y-1">
          <button
            @click="activeTab = 'profile'"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'profile'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Profile
          </button>
          <button
            @click="activeTab = 'security'"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'security'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            Security
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1">
        <UiCard>
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'">
            <h2 class="text-lg font-semibold text-neutral-900 mb-6">Profile</h2>

            <!-- Profile Info -->
            <div class="py-4 border-b border-neutral-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <span class="text-sm text-neutral-500 w-32">Profile</span>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        v-if="user.imageUrl"
                        :src="user.imageUrl"
                        :alt="user.fullName || 'Profile'"
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-else
                        class="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-medium"
                      >
                        {{ initials }}
                      </div>
                    </div>
                    <span class="font-medium text-neutral-900">{{ user.fullName || 'User' }}</span>
                  </div>
                </div>
                <UiButton variant="ghost" size="sm" @click="openUpdateProfileModal">
                  Update profile
                </UiButton>
              </div>
            </div>

            <!-- Email Addresses -->
            <div class="py-4 border-b border-neutral-100">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-neutral-500 w-32">Email addresses</span>
                <UiButton variant="ghost" size="sm" @click="openAddEmailModal">
                  + Add email
                </UiButton>
              </div>
              <div class="space-y-2 ml-32">
                <div
                  v-for="email in user.emailAddresses"
                  :key="email.id"
                  class="flex items-center justify-between py-2"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-neutral-900">{{ email.emailAddress }}</span>
                    <UiBadge v-if="email.id === user.primaryEmailAddressId" size="sm">
                      Primary
                    </UiBadge>
                  </div>
                  <div class="relative" data-menu>
                    <button
                      @click.stop="toggleEmailMenu(email.id)"
                      class="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </button>
                    <Transition
                      enter-active-class="transition ease-out duration-100"
                      enter-from-class="opacity-0 scale-95"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-75"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-95"
                    >
                      <div
                        v-if="openEmailMenuId === email.id"
                        class="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-100 py-1 z-10"
                      >
                        <button
                          v-if="email.id !== user.primaryEmailAddressId"
                          @click="handleSetPrimaryEmail(email.id)"
                          :disabled="settingPrimaryEmail"
                          class="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                        >
                          Set as primary
                        </button>
                        <button
                          v-if="email.id !== user.primaryEmailAddressId"
                          @click="handleRemoveEmail(email)"
                          :disabled="removingEmail"
                          class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>

            <!-- Connected Accounts -->
            <div class="py-4">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-neutral-500 w-32">Connected accounts</span>
                <UiButton variant="ghost" size="sm" @click="showConnectAccountModal = true">
                  + Connect account
                </UiButton>
              </div>
              <div class="space-y-2 ml-32">
                <div
                  v-for="account in user.externalAccounts"
                  :key="account.id"
                  class="flex items-center justify-between py-2"
                >
                  <div class="flex items-center gap-3">
                    <!-- Provider Icon -->
                    <div class="w-6 h-6 flex items-center justify-center">
                      <svg v-if="account.provider === 'google'" viewBox="0 0 24 24" class="w-5 h-5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <svg v-else-if="account.provider === 'github'" viewBox="0 0 24 24" class="w-5 h-5">
                        <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span v-else class="text-xs text-neutral-500">{{ account.provider }}</span>
                    </div>
                    <span class="text-sm text-neutral-900">{{ account.emailAddress }}</span>
                  </div>
                  <div class="relative" data-menu>
                    <button
                      @click.stop="toggleAccountMenu(account.id)"
                      class="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </button>
                    <Transition
                      enter-active-class="transition ease-out duration-100"
                      enter-from-class="opacity-0 scale-95"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-75"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-95"
                    >
                      <div
                        v-if="openAccountMenuId === account.id"
                        class="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-neutral-100 py-1 z-10"
                      >
                        <button
                          @click="handleDisconnectAccount(account)"
                          :disabled="disconnectingAccount"
                          class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>
                <div v-if="user.externalAccounts.length === 0" class="text-sm text-neutral-500 py-2">
                  No connected accounts
                </div>
              </div>
            </div>
          </div>

          <!-- Security Tab -->
          <div v-else-if="activeTab === 'security'">
            <h2 class="text-lg font-semibold text-neutral-900 mb-6">Security</h2>

            <!-- Password -->
            <div v-if="hasPassword" class="py-4 border-b border-neutral-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <span class="text-sm text-neutral-500 w-32">Password</span>
                  <span class="text-sm text-neutral-900">••••••••</span>
                </div>
                <UiButton variant="ghost" size="sm" @click="openChangePasswordModal">
                  Change password
                </UiButton>
              </div>
            </div>

            <!-- Two-Factor Authentication -->
            <div class="py-4 border-b border-neutral-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <span class="text-sm text-neutral-500 w-32">Two-factor auth</span>
                  <div class="flex items-center gap-2">
                    <UiBadge v-if="hasTotpEnabled" variant="success" size="sm">Enabled</UiBadge>
                    <span v-else class="text-sm text-neutral-500">Not enabled</span>
                  </div>
                </div>
                <UiButton
                  v-if="hasTotpEnabled"
                  variant="ghost"
                  size="sm"
                  @click="showDisableTotpModal = true"
                >
                  Disable
                </UiButton>
                <UiButton
                  v-else
                  variant="ghost"
                  size="sm"
                  :loading="enablingTotp"
                  @click="openEnableTotpModal"
                >
                  Enable
                </UiButton>
              </div>
            </div>

            <!-- Active Sessions -->
            <div class="py-4 border-b border-neutral-100">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-neutral-500 w-32">Active sessions</span>
                <UiButton v-if="loadingSessions" variant="ghost" size="sm" :loading="true" disabled>
                  Loading
                </UiButton>
              </div>
              <div v-if="loadingSessions" class="flex justify-center py-4 ml-32">
                <UiSpinner />
              </div>
              <div v-else class="space-y-3 ml-32">
                <div
                  v-for="session in sessions"
                  :key="session.id"
                  class="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg"
                >
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-neutral-900">
                        {{ formatSessionInfo(session).device }}
                      </span>
                      <UiBadge v-if="session.id === currentSessionId" size="sm" variant="success">
                        Current
                      </UiBadge>
                    </div>
                    <span class="text-xs text-neutral-500">
                      {{ formatSessionInfo(session).location }} · Last active {{ formatSessionInfo(session).lastActive }}
                    </span>
                  </div>
                  <UiButton
                    v-if="session.id !== currentSessionId"
                    variant="ghost"
                    size="sm"
                    :loading="revokingSession === session.id"
                    @click="handleRevokeSession(session)"
                  >
                    Sign out
                  </UiButton>
                </div>
                <div v-if="sessions.length === 0" class="text-sm text-neutral-500 py-2">
                  No active sessions
                </div>
              </div>
            </div>

            <!-- Delete Account (Danger Zone) -->
            <div class="py-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm text-neutral-500 w-32 block">Delete account</span>
                  <p class="text-xs text-neutral-400 mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  class="text-sm text-red-600 hover:text-red-700 font-medium"
                  @click="openDeleteAccountModal"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
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
          <label class="block text-sm font-medium text-neutral-700 mb-2">Avatar</label>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full overflow-hidden">
              <img
                v-if="profileForm.avatarPreview"
                :src="profileForm.avatarPreview"
                alt="Avatar preview"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-xl font-medium"
              >
                {{ initials }}
              </div>
            </div>
            <div class="flex gap-2">
              <label class="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarFileSelect"
                />
                <span class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
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
          <label class="block text-sm font-medium text-neutral-700 mb-1">First name</label>
          <UiInput v-model="profileForm.firstName" placeholder="First name" />
        </div>
        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Last name</label>
          <UiInput v-model="profileForm.lastName" placeholder="Last name" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showUpdateProfileModal = false">Cancel</UiButton>
          <UiButton :loading="updatingProfile" @click="handleUpdateProfile">Save</UiButton>
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
          <label class="block text-sm font-medium text-neutral-700 mb-1">Email address</label>
          <UiInput v-model="emailForm.email" type="email" placeholder="you@example.com" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showAddEmailModal = false">Cancel</UiButton>
          <UiButton :loading="addingEmail" @click="handleAddEmail">Add email</UiButton>
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
          We've sent a verification code to <span class="font-medium">{{ pendingEmailAddress?.emailAddress }}</span>.
          Enter the code below to verify this email address.
        </p>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Verification code</label>
          <UiInput v-model="emailForm.verificationCode" placeholder="Enter code" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showVerifyEmailModal = false">Cancel</UiButton>
          <UiButton :loading="verifyingEmail" @click="handleVerifyEmail">Verify</UiButton>
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
            <svg v-if="provider.icon === 'google'" viewBox="0 0 24 24" class="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <svg v-else-if="provider.icon === 'github'" viewBox="0 0 24 24" class="w-5 h-5">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <span class="text-sm font-medium text-neutral-700">{{ provider.name }}</span>
        </button>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <UiButton variant="secondary" @click="showConnectAccountModal = false">Cancel</UiButton>
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
          <label class="block text-sm font-medium text-neutral-700 mb-1">Current password</label>
          <UiInput v-model="passwordForm.currentPassword" type="password" placeholder="Enter current password" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">New password</label>
          <UiInput v-model="passwordForm.newPassword" type="password" placeholder="Enter new password" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Confirm new password</label>
          <UiInput v-model="passwordForm.confirmPassword" type="password" placeholder="Confirm new password" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showChangePasswordModal = false">Cancel</UiButton>
          <UiButton :loading="changingPassword" @click="handleChangePassword">Change password</UiButton>
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
          Scan this QR code with your authenticator app (like Google Authenticator, Authy, or 1Password), then enter the verification code below.
        </p>
        <div v-if="totpResource?.uri" class="flex justify-center py-4">
          <img
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpResource.uri)}`"
            alt="TOTP QR Code"
            class="w-48 h-48"
          />
        </div>
        <div v-if="totpResource?.secret" class="text-center">
          <p class="text-xs text-neutral-500 mb-1">Or enter this code manually:</p>
          <code class="text-sm bg-neutral-100 px-3 py-1 rounded font-mono">{{ totpResource.secret }}</code>
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Verification code</label>
          <UiInput v-model="totpForm.code" placeholder="Enter 6-digit code" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showEnableTotpModal = false">Cancel</UiButton>
          <UiButton :loading="verifyingTotp" @click="handleVerifyTotp">Verify and enable</UiButton>
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
            Save these backup codes in a secure place. You can use them to sign in if you lose access to your authenticator app.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-2 p-4 bg-neutral-50 rounded-lg">
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
          <UiButton @click="showBackupCodesModal = false">Done</UiButton>
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
        Are you sure you want to disable two-factor authentication? Your account will be less secure without it.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showDisableTotpModal = false">Cancel</UiButton>
          <UiButton variant="danger" :loading="disablingTotp" @click="handleDisableTotp">Disable</UiButton>
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
            This action is permanent and cannot be undone. All your data will be permanently deleted, including your profile, settings, and any associated content.
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            Type <span class="font-mono bg-neutral-100 px-1">DELETE</span> to confirm
          </label>
          <UiInput v-model="deleteForm.confirmation" placeholder="DELETE" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showDeleteAccountModal = false">Cancel</UiButton>
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
