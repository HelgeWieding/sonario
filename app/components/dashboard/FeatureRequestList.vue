<script setup lang="ts">
import type { FeatureRequest } from '~~/shared/types'
import { STATUS_LABELS, CATEGORY_LABELS } from '~~/shared/constants'

interface Props {
  requests: FeatureRequest[]
  productSlug: string
}

defineProps<Props>()

function getStatusVariant(status: string) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    new: 'info',
    reviewing: 'warning',
    planned: 'default',
    in_progress: 'warning',
    completed: 'success',
    rejected: 'error',
  }
  return variants[status] || 'default'
}

</script>

<template>
  <div class="space-y-3">
    <div
      v-for="request in requests"
      :key="request.id"
      class="block"
    >
      <NuxtLink :to="`/${productSlug}/feature-requests/${request.id}`">
        <UiCard class="hover:border-primary-300 transition-colors cursor-pointer">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 truncate">{{ request.title }}</h4>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ request.description }}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <UiBadge :variant="getStatusVariant(request.status)">
                {{ STATUS_LABELS[request.status] }}
              </UiBadge>
              <span class="text-xs text-gray-400">{{ CATEGORY_LABELS[request.category] }}</span>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span>{{ request.feedbackCount }} feedback</span>
            <span v-if="request.aiGenerated" class="text-primary-600">AI generated</span>
          </div>
        </UiCard>
      </NuxtLink>
    </div>
  </div>
</template>
