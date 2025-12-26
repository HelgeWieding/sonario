<script setup lang="ts">
const { user } = useUser()
</script>

<template>
  <header class="bg-white border-b border-gray-200">
    <div class="px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/dashboard" class="text-xl font-bold text-primary-600">
          Sonario
        </NuxtLink>
      </div>

      <div class="flex items-center gap-4">
        <div v-if="user" class="flex items-center gap-3">
          <span class="text-sm text-gray-600">{{ user.emailAddresses[0]?.emailAddress }}</span>
          <UserButton />
        </div>
      </div>
    </div>
  </header>
</template>
