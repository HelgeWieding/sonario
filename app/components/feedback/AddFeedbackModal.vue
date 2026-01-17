<script setup lang="ts">
import type { FeatureRequest } from '~~/shared/types'
import type { Sentiment } from '~~/shared/constants/enums'

interface Props {
  open: boolean
  featureRequests: FeatureRequest[]
  loadingRequests?: boolean
}

interface FeedbackForm {
  featureRequestId: string
  content: string
  sentiment: Sentiment
  senderEmail: string
  senderName: string
}

const props = withDefaults(defineProps<Props>(), {
  loadingRequests: false,
})

const emit = defineEmits<{
  close: []
  submit: [form: FeedbackForm]
}>()

const submitting = ref(false)

const form = ref<FeedbackForm>({
  featureRequestId: '',
  content: '',
  sentiment: 'neutral',
  senderEmail: '',
  senderName: '',
})

const isFormValid = computed(() => form.value.content.trim().length > 0)

const sentimentOptions = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

const featureRequestOptions = computed(() => [
  { value: '', label: 'None (standalone feedback)' },
  ...props.featureRequests.map(r => ({ value: r.id, label: r.title })),
])

function resetForm() {
  form.value = {
    featureRequestId: '',
    content: '',
    sentiment: 'neutral',
    senderEmail: '',
    senderName: '',
  }
}

function handleClose() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  if (!isFormValid.value) return
  submitting.value = true
  try {
    emit('submit', { ...form.value })
  } finally {
    submitting.value = false
  }
}

defineExpose({
  resetForm,
  setSubmitting: (value: boolean) => { submitting.value = value },
})
</script>

<template>
  <UiModal :open="open" title="Add Feedback" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Feedback Content</label>
        <textarea
          v-model="form.content"
          rows="4"
          placeholder="Enter the feedback..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
        <UiSelect v-model="form.sentiment" :options="sentimentOptions" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Link to Feature Request</label>
        <UiSelect
          v-model="form.featureRequestId"
          :options="featureRequestOptions"
          :disabled="loadingRequests"
          placeholder="Select a feature request (optional)"
        />
        <p class="text-xs text-gray-500 mt-1">Optionally link this feedback to an existing feature request</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
          <UiInput v-model="form.senderName" placeholder="Optional" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
          <UiInput v-model="form.senderEmail" type="email" placeholder="Optional" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <UiButton type="button" variant="secondary" @click="handleClose">
          Cancel
        </UiButton>
        <UiButton type="submit" :loading="submitting" :disabled="!isFormValid">
          Add Feedback
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
