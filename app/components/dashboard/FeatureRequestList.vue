<script setup lang="ts">
import type { FeatureRequest } from '~~/shared/types'
import { STATUS_LABELS, CATEGORY_LABELS } from '~~/shared/constants'

interface Props {
  requests: FeatureRequest[]
  productSlug: string
}

const props = defineProps<Props>()
const { buildProductRoute } = useOrgSlug()

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

function getRequestRoute(requestId: string) {
  return buildProductRoute(props.productSlug, `feature-requests/${requestId}`)
}

</script>

<template>
  <div class="space-y-3">
    <div
      v-for="request in requests"
      :key="request.id"
      class="block"
    >
      <NuxtLink :to="getRequestRoute(request.id)">
        <UiCard class="cursor-pointer">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-neutral-900 truncate">{{ request.title }}</h4>
              <p class="text-sm text-neutral-500 mt-1 line-clamp-2">{{ request.description }}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <UiBadge :variant="getStatusVariant(request.status)">
                {{ STATUS_LABELS[request.status] }}
              </UiBadge>
              <span class="text-xs text-neutral-400">{{ CATEGORY_LABELS[request.category] }}</span>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-4 text-sm text-neutral-500">
            <span>{{ request.feedbackCount }} feedback</span>
            <span v-if="request.aiGenerated" class="text-accent-600 font-medium">AI generated</span>
          </div>
        </UiCard>
      </NuxtLink>
    </div>
  </div>
</template>
