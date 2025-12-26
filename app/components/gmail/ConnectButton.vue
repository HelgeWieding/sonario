<script setup lang="ts">
const { status, loading, initiateConnection, disconnect } = useGmailConnection()
</script>

<template>
  <div>
    <div v-if="status?.isConnected" class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="status.isActive ? 'bg-green-500' : 'bg-gray-400'" />
        <span class="text-sm text-gray-600">{{ status.email }}</span>
      </div>
      <UiButton variant="secondary" size="sm" :loading="loading" @click="disconnect">
        Disconnect
      </UiButton>
    </div>
    <UiButton v-else :loading="loading" @click="initiateConnection">
      Connect Gmail
    </UiButton>
  </div>
</template>
