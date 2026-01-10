<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { orgId } = useAuth()
</script>

<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Team</h1>
    </div>

    <!-- No Organization - Show Create UI -->
    <template v-if="!orgId">
      <UiCard class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">Create a Team</h2>
        <p class="text-gray-600 mb-4">
          Create a team to invite colleagues and collaborate on feature requests.
          All team members will have full access to your products.
        </p>
        <CreateOrganization
          :after-create-organization-url="'/dashboard'"
        />
      </UiCard>
    </template>

    <!-- Has Organization - Show Management UI -->
    <template v-else>
      <OrganizationProfile />
    </template>
  </div>
</template>
