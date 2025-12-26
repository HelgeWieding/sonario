<script setup lang="ts">
const { status, loading, fetchStatus, syncNow } = useHelpScoutConnection()

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

const tokenExpiresIn = computed(() => {
  if (!status.value?.tokenExpiresAt) return null
  const expiration = new Date(status.value.tokenExpiresAt)
  const now = new Date()
  const diffHours = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60))
  return diffHours
})
</script>

<template>
  <UiCard>
    <h3 class="font-semibold text-gray-900 mb-4">Help Scout Connection</h3>

    <div v-if="loading" class="flex justify-center py-4">
      <UiSpinner />
    </div>

    <div v-else-if="!status?.isConnected" class="text-center py-4">
      <p class="text-gray-500 mb-4">Connect your Help Scout account to automatically process feature requests from support conversations.</p>
      <HelpscoutConnectButton />
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-700">Status</p>
          <p class="text-sm text-gray-500">Help Scout connected</p>
        </div>
        <UiBadge :variant="status.isActive ? 'success' : 'warning'">
          {{ status.isActive ? 'Active' : 'Inactive' }}
        </UiBadge>
      </div>

      <div v-if="status.tokenExpiresAt">
        <p class="text-sm font-medium text-gray-700">Token Status</p>
        <p class="text-sm text-gray-500">
          <template v-if="tokenExpiresIn && tokenExpiresIn > 0">
            Expires in {{ tokenExpiresIn }} hours
          </template>
          <template v-else>
            <span class="text-red-600">Expired - please reconnect</span>
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
        <HelpscoutConnectButton />
      </div>
    </div>
  </UiCard>
</template>
