<script setup lang="ts">
const { user } = useUser()
const { product } = useProduct()
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div class="px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <NuxtLink to="/dashboard" class="text-xl font-bold text-primary-600">
          Sonario
        </NuxtLink>
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
