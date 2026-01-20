<script setup lang="ts">
const { user } = useUser()
const clerk = useClerk()
const { buildOrgRoute } = useOrgSlug()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Computed properties
const fullName = computed(() => user.value?.fullName || 'User')
const email = computed(() => user.value?.emailAddresses[0]?.emailAddress || '')
const imageUrl = computed(() => user.value?.imageUrl)
const initials = computed(() => {
  const first = user.value?.firstName?.[0] || ''
  const last = user.value?.lastName?.[0] || ''
  if (first && last) return `${first}${last}`.toUpperCase()
  if (first) return first.toUpperCase()
  return email.value?.[0]?.toUpperCase() || '?'
})

// Profile route
const profileRoute = computed(() => buildOrgRoute('profile'))

// Toggle dropdown
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// Close dropdown
function closeDropdown() {
  isOpen.value = false
}

// Handle sign out
async function handleSignOut() {
  closeDropdown()
  await clerk.value?.signOut()
}

// Handle click outside
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Handle escape key
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

// Setup event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Trigger Button -->
    <button
      @click.stop="toggleDropdown"
      class="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-all"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="fullName"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-sm font-medium"
      >
        {{ initials }}
      </div>
    </button>

    <!-- Dropdown Panel -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-100 py-1 z-50"
      >
        <!-- User Info Header -->
        <div class="px-4 py-3 border-b border-neutral-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <img
                v-if="imageUrl"
                :src="imageUrl"
                :alt="fullName"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-medium"
              >
                {{ initials }}
              </div>
            </div>
            <div class="min-w-0">
              <div class="text-sm font-medium text-neutral-900 truncate">
                {{ fullName }}
              </div>
              <div class="text-xs text-neutral-500 truncate">
                {{ email }}
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="py-1">
          <NuxtLink
            :to="profileRoute"
            class="flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            @click="closeDropdown"
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
            Manage account
          </NuxtLink>

          <button
            @click="handleSignOut"
            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
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
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
