<script setup lang="ts">
import { SENTIMENT_LABELS } from '~~/shared/constants'

definePageMeta({
  middleware: 'auth',
})

interface FeedbackItem {
  id: string
  content: string
  sentiment: string
  senderEmail: string | null
  senderName: string | null
  aiExtracted: boolean
  createdAt: string
  featureRequest: {
    id: string
    title: string
    productId: string
  } | null
}

interface ContactWithFeedback {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
  feedback: FeedbackItem[]
}

const route = useRoute()
const contactId = route.params.contactId as string

const loading = ref(true)
const contact = ref<ContactWithFeedback | null>(null)

async function loadContact() {
  loading.value = true
  try {
    const { data } = await $fetch<{ data: ContactWithFeedback }>(`/api/contacts/${contactId}`)
    contact.value = data
  } catch (error) {
    console.error('Failed to load contact:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case 'positive': return 'bg-green-100 text-green-800'
    case 'negative': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  loadContact()
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <!-- Not found -->
    <div v-else-if="!contact" class="text-center py-12">
      <p class="text-gray-500">Contact not found</p>
      <NuxtLink to="/contacts" class="text-blue-600 hover:underline">
        Back to Contacts
      </NuxtLink>
    </div>

    <!-- Contact detail -->
    <div v-else>
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink to="/contacts" class="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
          &larr; Back to Contacts
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ contact.name || contact.email }}
        </h1>
        <p v-if="contact.name" class="text-gray-500 mt-1">{{ contact.email }}</p>
        <p class="text-sm text-gray-400 mt-2">
          Contact since {{ formatDate(contact.createdAt) }}
        </p>
      </div>

      <!-- Feedback list -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-gray-900">
          Feedback ({{ contact.feedback.length }})
        </h2>
      </div>

      <div v-if="contact.feedback.length === 0" class="text-center py-12 bg-white border border-gray-200 rounded-lg">
        <p class="text-gray-500">No feedback from this contact yet</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="fb in contact.feedback"
          :key="fb.id"
          class="bg-white border border-gray-200 rounded-lg p-4"
        >
          <!-- Feature request link -->
          <div v-if="fb.featureRequest" class="mb-3">
            <NuxtLink
              :to="`/products/${fb.featureRequest.productId}/requests/${fb.featureRequest.id}`"
              class="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {{ fb.featureRequest.title }}
            </NuxtLink>
          </div>

          <!-- Content -->
          <p class="text-gray-700 whitespace-pre-wrap">{{ fb.content }}</p>

          <!-- Meta -->
          <div class="mt-3 flex items-center gap-3 text-sm">
            <span class="text-gray-400">
              {{ formatDate(fb.createdAt) }}
            </span>
            <span
              :class="[getSentimentColor(fb.sentiment), 'px-2 py-0.5 rounded-full text-xs font-medium']"
            >
              {{ SENTIMENT_LABELS[fb.sentiment as keyof typeof SENTIMENT_LABELS] || fb.sentiment }}
            </span>
            <span
              v-if="fb.aiExtracted"
              class="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
            >
              AI Extracted
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
