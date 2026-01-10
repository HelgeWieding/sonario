<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user } = useUser()
</script>

<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Profile</h1>
    </div>

    <UiCard>
      <div v-if="user" class="space-y-4">
        <div class="flex items-center gap-4">
          <img
            v-if="user.imageUrl"
            :src="user.imageUrl"
            :alt="user.fullName || 'Profile'"
            class="w-16 h-16 rounded-full"
          >
          <div
            v-else
            class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold"
          >
            {{ user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || '?' }}
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ user.fullName || 'User' }}
            </h2>
            <p class="text-gray-500">{{ user.emailAddresses[0]?.emailAddress }}</p>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            Account management is handled through Clerk. Click below to manage your account settings.
          </p>
          <div class="mt-4">
            <UserButton />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <UiSpinner />
      </div>
    </UiCard>
  </div>
</template>
