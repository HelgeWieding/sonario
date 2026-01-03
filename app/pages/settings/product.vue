<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'product'],
})

const { product, updateProduct } = useProduct()

const productName = ref('')
const autoDraftsEnabled = ref(false)
const saving = ref(false)
const saved = ref(false)

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
