<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'product'],
})

const { selectedProduct: product, refreshProducts } = useProducts()
const { updateProduct } = useProduct()
const { orgData, memberships, hasMemberships } = useOrganizationManagement()

const productName = ref('')
const autoDraftsEnabled = ref(false)
const saving = ref(false)
const saved = ref(false)
const updatingSharing = ref(false)

// Confirmation dialog state
const showConfirmDialog = ref(false)
const pendingOrgId = ref<string | null>(null)

// Sentinel value for "personal" (no organization)
const PERSONAL_VALUE = '__personal__'

// Current sharing selection (PERSONAL_VALUE = personal, org ID = shared with that org)
const selectedOrgId = computed(() => product.value?.organizationId ?? PERSONAL_VALUE)

// Get the name of the currently assigned organization
const currentAssignedOrgName = computed(() => {
  if (!product.value?.organizationId) return null
  const org = memberships.value.find(m => m.id === product.value?.organizationId)
  return org?.name ?? 'Unknown Organization'
})

// Options for the sharing dropdown - include all orgs user is a member of
const sharingOptions = computed(() => {
  const options = [
    { value: PERSONAL_VALUE, label: 'Personal (only you)' },
  ]

  // Add all organizations the user is a member of
  for (const membership of memberships.value) {
    options.push({
      value: membership.id,
      label: `${membership.name} (all team members)`,
    })
  }

  return options
})

// Confirmation dialog message
const confirmMessage = computed(() => {
  if (pendingOrgId.value === null) return ''

  const newOrg = memberships.value.find(m => m.id === pendingOrgId.value)

  if (pendingOrgId.value === PERSONAL_VALUE) {
    // Removing from organization
    return `Are you sure you want to remove this product from "${currentAssignedOrgName.value}"? Only you will be able to access it.`
  } else if (selectedOrgId.value === PERSONAL_VALUE) {
    // Adding to organization
    return `Are you sure you want to share this product with "${newOrg?.name}"? All team members will be able to view and manage it.`
  } else {
    // Changing organization
    return `Are you sure you want to move this product from "${currentAssignedOrgName.value}" to "${newOrg?.name}"?`
  }
})

// Update form when product loads
watch(product, (newProduct) => {
  if (newProduct) {
    productName.value = newProduct.name
    autoDraftsEnabled.value = newProduct.autoDraftsEnabled ?? false
  }
}, { immediate: true })

async function handleSave() {
  if (!product.value || !productName.value.trim()) return

  saving.value = true
  saved.value = false

  const success = await updateProduct({
    name: productName.value.trim(),
    autoDraftsEnabled: autoDraftsEnabled.value,
  })

  saving.value = false

  if (success) {
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 2000)
  }
}

function handleSharingSelect(newOrgId: string) {
  // Don't show dialog if selection hasn't changed
  if (newOrgId === selectedOrgId.value) return

  pendingOrgId.value = newOrgId
  showConfirmDialog.value = true
}

async function confirmSharingChange() {
  if (!product.value || pendingOrgId.value === null) return

  showConfirmDialog.value = false
  updatingSharing.value = true

  try {
    // Convert sentinel value to null for API
    const orgIdForApi = pendingOrgId.value === PERSONAL_VALUE ? null : pendingOrgId.value

    await $fetch(`/api/products/${product.value.id}/organization`, {
      method: 'PUT',
      body: { organizationId: orgIdForApi },
    })

    // Refresh products data to get updated organizationId
    await refreshProducts()
  } catch (error: any) {
    console.error('Failed to update team sharing:', error)
  } finally {
    updatingSharing.value = false
    pendingOrgId.value = null
  }
}

function cancelSharingChange() {
  showConfirmDialog.value = false
  pendingOrgId.value = null
}
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Product Settings</h1>

    <div class="space-y-6">
      <UiCard>
        <h2 class="font-semibold text-gray-900 mb-4">Product Name</h2>
        <p class="text-sm text-gray-500 mb-4">
          This is the name of your product. Feature requests will be associated with this product.
        </p>

        <div>
          <label class="label">Name</label>
          <UiInput
            v-model="productName"
            placeholder="My Product"
            @keyup.enter="handleSave"
          />
        </div>
      </UiCard>

      <UiCard v-if="orgData && hasMemberships">
        <h2 class="font-semibold text-gray-900 mb-4">Team Sharing</h2>
        <p class="text-sm text-gray-500 mb-4">
          Choose who can access this product and its feature requests.
        </p>

        <div>
          <label class="label">Access</label>
          <UiSelect
            :model-value="selectedOrgId"
            :options="sharingOptions"
            :disabled="updatingSharing"
            placeholder="Select access level"
            @update:model-value="handleSharingSelect"
          />
          <p class="text-sm text-gray-500 mt-2">
            {{ selectedOrgId !== PERSONAL_VALUE ? 'All team members can view and manage this product' : 'Only you can access this product' }}
          </p>
        </div>
      </UiCard>

      <!-- Confirmation Dialog -->
      <UiModal :open="showConfirmDialog" title="Change Product Access" @close="cancelSharingChange">
        <p class="text-gray-600">{{ confirmMessage }}</p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UiButton variant="secondary" @click="cancelSharingChange">
              Cancel
            </UiButton>
            <UiButton :loading="updatingSharing" @click="confirmSharingChange">
              Confirm
            </UiButton>
          </div>
        </template>
      </UiModal>

      <UiCard>
        <h2 class="font-semibold text-gray-900 mb-4">HelpScout Auto-Drafts</h2>
        <p class="text-sm text-gray-500 mb-4">
          When enabled, automatically generate draft responses in HelpScout when a customer
          writes about an existing feature request. Drafts are saved for your review before sending.
        </p>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">Enable Auto-Drafts</p>
            <p class="text-sm text-gray-500">
              Only applies to conversations matching existing feature requests
            </p>
          </div>
          <UiToggle v-model="autoDraftsEnabled" />
        </div>
      </UiCard>

      <div class="flex items-center gap-3">
        <UiButton :loading="saving" @click="handleSave">
          Save Changes
        </UiButton>
        <span v-if="saved" class="text-sm text-green-600">Saved!</span>
      </div>
    </div>
  </div>
</template>
