<script setup lang="ts">
const { user } = useUser()
const { product } = useProduct()
const { orgData, hasMemberships, currentOrgName, isOrgContext } = useOrganizationManagement()
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div class="px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <NuxtLink to="/dashboard" class="text-xl font-bold text-primary-600">
          Sonario
        </NuxtLink>

        <!-- Only show org switcher when org data is loaded (SSR) -->
        <div v-if="orgData" class="ml-2">
          <OrganizationSwitcher
            :hide-personal="false"
            :after-create-organization-url="'/settings/team'"
            :after-select-organization-url="'/dashboard'"
            :after-select-personal-url="'/dashboard'"
          />
        </div>

        <template v-if="product">
          <span class="text-gray-300">/</span>
          <span class="text-gray-700 font-medium">{{ product.name }}</span>
        </template>
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
