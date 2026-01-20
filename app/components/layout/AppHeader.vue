<script setup lang="ts">
const { user } = useUser()
const { selectedProduct, hasMultipleProducts, products, selectProduct } = useProducts()
const { orgData } = useOrganizationManagement()
const { buildOrgRoute } = useOrgSlug()

// Dashboard path with org slug
const dashboardPath = computed(() => buildOrgRoute('dashboard'))
</script>

<template>
  <header class="bg-white sticky top-0 z-50">
    <div class="h-14 px-4 flex items-center justify-between">
      <!-- Left section: Logo + Navigation -->
      <div class="flex items-center gap-1">
        <!-- Logo -->
        <NuxtLink
          :to="dashboardPath"
          class="flex items-center gap-2 px-2 py-1.5 -ml-2 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <div class="w-7 h-7 bg-accent-500 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 9.5L5 4l3.5 3.5h7L19 4l3 5.5c0 6.5-4 11-10 11S2 16 2 9.5z"/>
              <ellipse cx="8.5" cy="12" rx="1.5" ry="2" class="fill-accent-700"/>
              <ellipse cx="15.5" cy="12" rx="1.5" ry="2" class="fill-accent-700"/>
              <path d="M12 15l-1 1.5h2L12 15z" class="fill-accent-700"/>
            </svg>
          </div>
          <span class="text-base font-semibold text-neutral-900">Sonario</span>
        </NuxtLink>

        <!-- Breadcrumb separator -->
        <span v-if="orgData || selectedProduct" class="text-neutral-300 mx-1">/</span>

        <!-- Organization Switcher -->
        <div v-if="orgData" class="flex items-center">
          <OrganizationSwitcher
            :hide-personal="true"
            :after-create-organization-url="'/onboarding/organization-check'"
            :after-select-organization-url="'/post-auth-redirect'"
            :after-select-personal-url="'/post-auth-redirect'"
          />
        </div>

        <!-- Product breadcrumb -->
        <template v-if="selectedProduct">
          <span v-if="orgData" class="text-neutral-300 mx-1">/</span>
          <template v-if="hasMultipleProducts">
            <ProductSelector
              :products="products"
              :selected="selectedProduct"
              @select="selectProduct"
            />
          </template>
          <template v-else>
            <span class="text-sm text-neutral-600">{{ selectedProduct.name }}</span>
          </template>
        </template>
      </div>

      <!-- Right section: User -->
      <UserDropdown v-if="user" />
    </div>
  </header>
</template>
