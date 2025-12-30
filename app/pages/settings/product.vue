<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { products, fetchProducts, updateProduct } = useProducts()

const productName = ref('')
const autoDraftsEnabled = ref(false)
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  await fetchProducts()
  if (products.value.length > 0) {
    productName.value = products.value[0].name
    autoDraftsEnabled.value = products.value[0].autoDraftsEnabled ?? false
  }
  loading.value = false
})

async function handleSave() {
  if (!products.value[0] || !productName.value.trim()) return

  saving.value = true
  saved.value = false

  const success = await updateProduct(products.value[0].id, {
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
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Product Settings</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <div v-else class="space-y-6">
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
