<script setup lang="ts">
import type { FeatureRequest } from '~~/shared/types'

interface Props {
  open: boolean
  featureRequests: FeatureRequest[]
  currentFeatureRequestId?: string | null
  loadingRequests?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loadingRequests: false,
  currentFeatureRequestId: null,
})

const emit = defineEmits<{
  close: []
  submit: [featureRequestId: string | null]
}>()

const submitting = ref(false)
const selectedFeatureRequestId = ref('')

const featureRequestOptions = computed(() => [
  { value: '', label: 'None (standalone feedback)' },
  ...props.featureRequests.map(r => ({ value: r.id, label: r.title })),
])

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    selectedFeatureRequestId.value = props.currentFeatureRequestId ?? ''
  }
})

function handleClose() {
  selectedFeatureRequestId.value = ''
  emit('close')
}

async function handleSubmit() {
  submitting.value = true
  try {
    emit('submit', selectedFeatureRequestId.value || null)
  } finally {
    submitting.value = false
  }
}

defineExpose({
  setSubmitting: (value: boolean) => { submitting.value = value },
})
</script>

<template>
  <UiModal :open="open" title="Link to Feature Request" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Feature Request</label>
        <UiSelect
          v-model="selectedFeatureRequestId"
          :options="featureRequestOptions"
          :disabled="loadingRequests"
          placeholder="Select a feature request"
        />
        <p class="text-xs text-gray-500 mt-1">Select a feature request to link this feedback to, or choose "None" to unlink.</p>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <UiButton type="button" variant="secondary" @click="handleClose">
          Cancel
        </UiButton>
        <UiButton type="submit" :loading="submitting">
          Save
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
