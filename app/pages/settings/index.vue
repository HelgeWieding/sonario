<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

    <div class="space-y-6">
      <UiCard>
        <h2 class="font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div class="space-y-2">
          <NuxtLink
            to="/settings/team"
            class="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-gray-900">Team</div>
            <div class="text-sm text-gray-500">Invite team members and manage your organization</div>
          </NuxtLink>
          <NuxtLink
            to="/settings/product"
            class="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-gray-900">Product</div>
            <div class="text-sm text-gray-500">Configure your product name and settings</div>
          </NuxtLink>
          <NuxtLink
            to="/settings/gmail"
            class="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-gray-900">Gmail Connection</div>
            <div class="text-sm text-gray-500">Manage your Gmail integration for processing feature requests</div>
          </NuxtLink>
          <NuxtLink
            to="/settings/helpscout"
            class="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-gray-900">Help Scout</div>
            <div class="text-sm text-gray-500">Connect Help Scout to process conversations</div>
          </NuxtLink>
          <NuxtLink
            to="/settings/profile"
            class="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-gray-900">Profile</div>
            <div class="text-sm text-gray-500">View and manage your account settings</div>
          </NuxtLink>
        </div>
      </UiCard>
    </div>
  </div>
</template>
