<script setup lang="ts">
import {
  STATUS_LABELS,
  CATEGORY_LABELS,
  STATUSES,
  SENTIMENTS,
  SENTIMENT_LABELS,
} from "~~/shared/constants";
import type { Sentiment } from "~~/shared/constants";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.productSlug as string);
const requestId = computed(() => route.params.requestId as string);
const { buildProductRoute } = useOrgSlug();

// Computed route for feature requests list
const featureRequestsPath = computed(() => buildProductRoute(slug.value, 'feature-requests'));

// Product is guaranteed to exist by middleware
const { product } = useProduct();

const {
  request,
  loading,
  fetchFeatureRequestClient,
  updateRequest,
  deleteRequest,
  clearRequest,
} = useFeatureRequest();
const { addFeedback, deleteFeedback, loading: addingFeedback } = useFeedback();

// Fetch on mount (client-side)
onMounted(() => {
  fetchFeatureRequestClient();
});

// Re-fetch when route params change (client-side navigation)
watch([slug, requestId], () => {
  fetchFeatureRequestClient();
});

// Clear state when leaving
onUnmounted(() => {
  clearRequest();
});

// Refresh function for use in handlers
async function refresh() {
  await fetchFeatureRequestClient();
}

const updating = ref(false);
const showDeleteModal = ref(false);
const showFeedbackModal = ref(false);

// Status options for UiSelect
const statusOptions = STATUSES.map(s => ({
  value: s,
  label: STATUS_LABELS[s]
}));

const feedbackForm = reactive({
  content: "",
  senderEmail: "",
  senderName: "",
  sentiment: undefined as Sentiment | undefined,
});

function resetFeedbackForm() {
  feedbackForm.content = "";
  feedbackForm.senderEmail = "";
  feedbackForm.senderName = "";
  feedbackForm.sentiment = undefined;
}

async function handleStatusChange(status: string) {
  if (!request.value) return;
  updating.value = true;
  await updateRequest({ status: status as any });
  await refresh();
  updating.value = false;
}

async function handleDelete() {
  const success = await deleteRequest();
  if (success) {
    router.push(featureRequestsPath.value);
  }
}

async function handleAddFeedback() {
  if (!feedbackForm.content.trim()) return;

  const feedback = await addFeedback({
    content: feedbackForm.content,
    senderEmail: feedbackForm.senderEmail || undefined,
    senderName: feedbackForm.senderName || undefined,
    sentiment: feedbackForm.sentiment,
  });

  if (feedback) {
    resetFeedbackForm();
    showFeedbackModal.value = false;
    await refresh();
  }
}

async function handleDeleteFeedback(feedbackId: string) {
  const success = await deleteFeedback(feedbackId);
  if (success) {
    await refresh();
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <div v-else-if="!request" class="text-center py-12">
      <div
        class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 text-gray-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-900 mb-2">
        Feature request not found
      </h2>
      <p class="text-gray-500 mb-4">
        This feature request doesn't exist or has been deleted.
      </p>
      <NuxtLink
        :to="featureRequestsPath"
        class="text-primary-600 hover:underline"
      >
        Back to Feature Requests
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink
          :to="featureRequestsPath"
          class="text-sm text-gray-500 hover:text-gray-700 mb-1 block"
        >
          &larr; Back to Feature Requests
        </NuxtLink>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main Content Card -->
        <div class="lg:col-span-2">
          <UiCard class="h-full">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-xl font-bold text-neutral-900">
                  {{ request.title }}
                </h1>
                <div class="flex items-center gap-2 mt-2">
                  <UiBadge>{{ CATEGORY_LABELS[request.category] }}</UiBadge>
                  <span
                    v-if="request.aiGenerated"
                    class="text-sm text-primary-600"
                    >AI Generated</span
                  >
                </div>
              </div>
              <UiButton
                variant="ghost"
                size="sm"
                @click="showDeleteModal = true"
                >Delete</UiButton
              >
            </div>

            <div class="prose max-w-none">
              <p class="text-neutral-700 whitespace-pre-wrap">
                {{ request.description }}
              </p>
            </div>

            <div class="mt-6 pt-6 border-t border-neutral-200">
              <p class="text-sm text-neutral-500">
                Created {{ new Date(request.createdAt).toLocaleDateString() }}
                <span v-if="request.sourceEmailId" class="ml-2"
                  >from email</span
                >
              </p>
            </div>
          </UiCard>
        </div>

        <!-- Sidebar -->
        <div>
          <UiCard class="h-full">
            <h3 class="font-semibold text-neutral-900 mb-4">Status</h3>
            <UiSelect
              :model-value="request.status"
              :options="statusOptions"
              :disabled="updating"
              @update:model-value="handleStatusChange"
            />

            <div class="mt-6">
              <h3 class="font-semibold text-neutral-900 mb-2">Statistics</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-neutral-500">Feedback Count</span>
                  <span class="font-medium">{{ request.feedbackCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-500">Category</span>
                  <span class="font-medium">{{
                    CATEGORY_LABELS[request.category]
                  }}</span>
                </div>
              </div>
            </div>
          </UiCard>
        </div>

        <!-- Feedback Section - separate row -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-neutral-900">
              Feedback ({{ request.feedback.length }})
            </h2>
            <UiButton size="sm" @click="showFeedbackModal = true">
              Add Feedback
            </UiButton>
          </div>

          <!-- Feedback List -->
          <div class="space-y-3">
            <UiCard v-for="fb in request.feedback" :key="fb.id">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-neutral-700">{{ fb.content }}</p>
                  <div
                    class="mt-2 flex items-center gap-2 text-sm text-neutral-500"
                  >
                    <span v-if="fb.senderEmail">{{
                      fb.senderName || fb.senderEmail
                    }}</span>
                    <span>{{
                      new Date(fb.createdAt).toLocaleDateString()
                    }}</span>
                    <UiBadge
                      v-if="fb.sentiment"
                      size="sm"
                      :variant="
                        fb.sentiment === 'positive'
                          ? 'success'
                          : fb.sentiment === 'negative'
                          ? 'error'
                          : 'default'
                      "
                    >
                      {{ fb.sentiment }}
                    </UiBadge>
                    <UiBadge v-if="fb.aiExtracted" size="sm"
                      >AI Extracted</UiBadge
                    >
                  </div>
                </div>
                <UiButton
                  variant="ghost"
                  size="sm"
                  @click="handleDeleteFeedback(fb.id)"
                >
                  Remove
                </UiButton>
              </div>
            </UiCard>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <UiModal
      :open="showDeleteModal"
      title="Delete Feature Request"
      @close="showDeleteModal = false"
    >
      <p class="text-gray-600">
        Are you sure you want to delete this feature request? This action cannot
        be undone.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showDeleteModal = false"
            >Cancel</UiButton
          >
          <UiButton variant="danger" @click="handleDelete">Delete</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Add Feedback Modal -->
    <UiModal
      :open="showFeedbackModal"
      title="Add Feedback"
      @close="showFeedbackModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Feedback</label
          >
          <textarea
            v-model="feedbackForm.content"
            class="input"
            rows="3"
            placeholder="Enter feedback..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Sender Email</label
          >
          <input
            v-model="feedbackForm.senderEmail"
            type="email"
            class="input"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Sender Name</label
          >
          <input
            v-model="feedbackForm.senderName"
            type="text"
            class="input"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Sentiment (optional)</label
          >
          <select v-model="feedbackForm.sentiment" class="input">
            <option :value="undefined">Select sentiment...</option>
            <option
              v-for="sentiment in SENTIMENTS"
              :key="sentiment"
              :value="sentiment"
            >
              {{ SENTIMENT_LABELS[sentiment] }}
            </option>
          </select>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="showFeedbackModal = false"
            >Cancel</UiButton
          >
          <UiButton :loading="addingFeedback" @click="handleAddFeedback"
            >Add Feedback</UiButton
          >
        </div>
      </template>
    </UiModal>
  </div>
</template>
