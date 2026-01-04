<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { orgData, isOrgContext, currentOrgName } = useOrganizationManagement()
</script>

<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <NuxtLink to="/settings" class="text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to Settings
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 mt-1">Team</h1>
    </div>

    <template v-if="orgData">
      <!-- No Organization - Show Create UI -->
      <UiCard v-if="!isOrgContext" class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">Create a Team</h2>
        <p class="text-gray-600 mb-4">
          Create a team to invite colleagues and collaborate on feature requests.
          All team members will have full access to your products.
        </p>
        <CreateOrganization
          :after-create-organization-url="'/settings/team'"
        />
      </UiCard>

      <!-- Has Organization - Show Management UI -->
      <template v-else>
        <UiCard class="mb-6">
          <h2 class="font-semibold text-gray-900 mb-4">
            {{ currentOrgName }}
          </h2>
          <p class="text-gray-600 mb-4">
            Invite team members and manage your organization settings.
          </p>
          <OrganizationProfile />
        </UiCard>
      </template>
    </template>
  </div>
</template>
