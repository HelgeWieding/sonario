<script setup lang="ts">
const { status, loading, fetchStatus, renewWatch, syncNow } = useGmailConnection()

const syncMessage = ref('')

onMounted(() => {
  fetchStatus()
})

async function handleSync() {
  syncMessage.value = ''
  const result = await syncNow()
  if (result) {
    syncMessage.value = result.message
    setTimeout(() => {
      syncMessage.value = ''
    }, 5000)
  }
}

const watchExpiresIn = computed(() => {
  if (!status.value?.watchExpiration) return null
  const expiration = new Date(status.value.watchExpiration)
  const now = new Date()
  const diffDays = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays
})
</script>

<template>
  <UiCard>
    <h3 class="font-semibold text-gray-900 mb-4">Gmail Connection</h3>

    <div v-if="loading" class="flex justify-center py-4">
      <UiSpinner />
    </div>

    <div v-else-if="!status?.isConnected" class="text-center py-4">
      <p class="text-gray-500 mb-4">Connect your Gmail to automatically process feature requests from emails.</p>
      <GmailConnectButton />
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-700">Connected Email</p>
          <p class="text-sm text-gray-500">{{ status.email }}</p>
        </div>
        <UiBadge :variant="status.isActive ? 'success' : 'warning'">
          {{ status.isActive ? 'Active' : 'Inactive' }}
        </UiBadge>
      </div>

      <div v-if="status.watchExpiration">
        <p class="text-sm font-medium text-gray-700">Watch Status</p>
        <p class="text-sm text-gray-500">
          <template v-if="watchExpiresIn && watchExpiresIn > 0">
            Expires in {{ watchExpiresIn }} days
          </template>
          <template v-else>
            <span class="text-red-600">Expired</span>
          </template>
        </p>
      </div>

      <div v-if="syncMessage" class="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
        {{ syncMessage }}
      </div>

      <div class="flex gap-2">
        <UiButton variant="primary" size="sm" :loading="loading" @click="handleSync">
          Sync Now
        </UiButton>
        <UiButton variant="secondary" size="sm" :loading="loading" @click="renewWatch">
          Renew Watch
        </UiButton>
        <GmailConnectButton />
      </div>
    </div>
  </UiCard>
</template>
