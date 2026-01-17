<script setup lang="ts">
interface Props {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger' | 'secondary'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmVariant: 'primary',
  loading: false,
})

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <UiModal :open="open" :title="title" @close="emit('close')">
    <div class="space-y-4">
      <p class="text-gray-600">{{ message }}</p>
      <slot />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton variant="secondary" @click="emit('close')">
          {{ cancelText }}
        </UiButton>
        <UiButton :variant="confirmVariant" :loading="loading" @click="emit('confirm')">
          {{ confirmText }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
