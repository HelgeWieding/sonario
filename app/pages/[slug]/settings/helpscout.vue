<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'product'],
})

const route = useRoute()
const { selectedProduct } = useProducts()
const { status, fetchStatus } = useHelpScoutConnection()

const successMessage = ref('')
const errorMessage = ref('')

onMounted(() => {
  fetchStatus()

  // Check for success/error from OAuth callback
  if (route.query.success) {
    successMessage.value = 'Help Scout connected successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }
  if (route.query.error) {
    const errorMessages: Record<string, string> = {
      missing_code: 'Authorization code missing',
      missing_tokens: 'Failed to get access tokens from Help Scout',
      connection_failed: 'Failed to connect to Help Scout',
    }
    errorMessage.value = errorMessages[route.query.error as string] || 'An error occurred'
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }
})
</script>

<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <NuxtLink
        :to="`/${selectedProduct?.slug}/settings`"
        class="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Settings
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 mt-1">Help Scout Connection</h1>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
    >
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
    >
      {{ errorMessage }}
    </div>

    <HelpscoutConnectionStatus />

    <div class="mt-6">
      <UiCard>
        <h3 class="font-semibold text-gray-900 mb-4">How it works</h3>
        <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Connect your Help Scout account using OAuth</li>
          <li>Configure a webhook in Help Scout to send conversation events to your app</li>
          <li>When new conversations arrive, our AI analyzes them for feature requests</li>
          <li>Feature requests are extracted and matched to existing ones or created as new</li>
          <li>Related feedback is automatically grouped together</li>
        </ol>

        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-700">
            <strong>Webhook Setup:</strong> In Help Scout, go to Manage → Apps → Webhooks and create a webhook pointing to:
          </p>
          <code class="block mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
            {{ $config.public.appUrl }}/webhooks/helpscout
          </code>
        </div>

        <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p class="text-sm text-gray-700">
            <strong>Note:</strong> We only read conversation content to detect feature requests.
            We never modify your Help Scout data.
          </p>
        </div>
      </UiCard>
    </div>
  </div>
</template>
