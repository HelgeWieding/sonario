<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const { selectedProduct } = useProducts()
const { status, fetchStatus } = useGmailConnection()
const { buildProductRoute } = useOrgSlug()

// Settings back link
const settingsPath = computed(() => buildProductRoute(selectedProduct.value?.slug ?? '', 'settings'))

const successMessage = ref('')
const errorMessage = ref('')

onMounted(() => {
  fetchStatus()

  // Check for success/error from OAuth callback
  if (route.query.success) {
    successMessage.value = 'Gmail connected successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }
  if (route.query.error) {
    const errorMessages: Record<string, string> = {
      missing_tokens: 'Failed to get access tokens from Gmail',
      email_fetch_failed: 'Failed to fetch email address',
      connection_failed: 'Failed to connect to Gmail',
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
        :to="settingsPath"
        class="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Settings
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 mt-1">Gmail Connection</h1>
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

    <GmailConnectionStatus />

    <div class="mt-6">
      <UiCard>
        <h3 class="font-semibold text-gray-900 mb-4">How it works</h3>
        <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Connect your Gmail account using OAuth</li>
          <li>We set up a real-time watch on your inbox using Google Pub/Sub</li>
          <li>When new emails arrive, our AI analyzes them for feature requests</li>
          <li>Feature requests are extracted and matched to existing ones or created as new</li>
          <li>Related feedback is automatically grouped together</li>
        </ol>

        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-700">
            <strong>Note:</strong> We only read your emails to detect feature requests.
            We never store the full email content, only the extracted request information.
          </p>
        </div>
      </UiCard>
    </div>
  </div>
</template>
