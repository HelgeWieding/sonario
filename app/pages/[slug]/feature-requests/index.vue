<script setup lang="ts">
import {
  STATUSES,
  STATUS_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
} from "~~/shared/constants";

definePageMeta({
  middleware: ["auth"],
});

// Product is guaranteed to exist by middleware
const route = useRoute();
const slug = computed(() => route.params.slug as string);
const { product, fetchProductServer } = useProduct();

await fetchProductServer(slug);

const {
  requests,
  loading: requestsLoading,
  fetchRequests,
  createRequest,
} = useFeatureRequests();

const statusFilter = ref("");
const categoryFilter = ref("");

// Add feature request dialog state
const showAddDialog = ref(false);
const creating = ref(false);
const newRequest = ref({
  title: "",
  description: "",
  category: "feature" as (typeof CATEGORIES)[number],
});

const isFormValid = computed(
  () => newRequest.value.title.trim() && newRequest.value.description.trim()
);

const statusOptions = [
  { value: "", label: "All Statuses" },
  ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
];

const categoryOptions = [
  { value: "", label: "All Categories" },
  ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
];

// Category options for form (without "All" option)
const formCategoryOptions = CATEGORIES.map((c) => ({
  value: c,
  label: CATEGORY_LABELS[c],
}));

async function loadRequests() {
  if (!product.value) return;
  await fetchRequests({
    productId: product.value.id,
    productSlug: product.value.slug,
    status: (statusFilter.value as any) || undefined,
    category: (categoryFilter.value as any) || undefined,
  });
}

onMounted(() => {
  loadRequests();
});

watch([statusFilter, categoryFilter], () => {
  loadRequests();
});

async function handleCreateRequest() {
  console.log(route.params.slug);

  creating.value = true;
  const result = await createRequest(route.params.slug as string, {
    productId: product.value?.id ?? "",
    title: newRequest.value.title.trim(),
    description: newRequest.value.description.trim(),
    category: newRequest.value.category,
  });
  creating.value = false;

  if (result) {
    closeAddDialog();
    await loadRequests();
  }
}

function closeAddDialog() {
  showAddDialog.value = false;
  newRequest.value = { title: "", description: "", category: "feature" };
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900 tracking-tight">
          Feature Requests
        </h1>
        <p v-if="product?.description" class="text-neutral-500 mt-1">
          {{ product?.description }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-2xl font-semibold text-neutral-900 tracking-tight">
            {{ product?.featureRequestCount }}
          </p>
          <p class="text-sm text-neutral-500">feature requests</p>
        </div>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="flex gap-4 mb-6">
      <div class="w-48">
        <UiSelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Filter by status"
        />
      </div>
      <div class="w-48">
        <UiSelect
          v-model="categoryFilter"
          :options="categoryOptions"
          placeholder="Filter by category"
        />
      </div>
      <UiButton class="ml-auto" @click="showAddDialog = true">
        Add Feature Request
      </UiButton>
    </div>

    <!-- Feature Requests List -->
    <div v-if="requestsLoading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <div v-else-if="requests.length === 0" class="text-center py-16">
      <div
        class="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 text-neutral-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z"
          />
        </svg>
      </div>
      <p class="text-neutral-900 font-medium mb-1">No feature requests found</p>
      <p class="text-sm text-neutral-500">
        Feature requests will appear here when processed from Gmail or added
        manually.
      </p>
    </div>

    <DashboardFeatureRequestList
      v-else
      :requests="requests"
      :product-slug="product?.slug ?? ''"
    />

    <!-- Add Feature Request Modal -->
    <UiModal
      :open="showAddDialog"
      title="Add Feature Request"
      @close="closeAddDialog"
    >
      <form @submit.prevent="handleCreateRequest" class="space-y-4">
        <div>
          <label class="label">Title</label>
          <UiInput v-model="newRequest.title" placeholder="Feature title" />
        </div>
        <div>
          <label class="label">Description</label>
          <textarea
            v-model="newRequest.description"
            rows="4"
            placeholder="Describe the feature request..."
            class="w-full px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent border border-neutral-200 rounded-lg transition-colors duration-150 hover:border-neutral-300 focus:outline-none focus:border-neutral-400"
          />
        </div>
        <div>
          <label class="label">Category</label>
          <UiSelect
            v-model="newRequest.category"
            :options="formCategoryOptions"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <UiButton type="button" variant="secondary" @click="closeAddDialog">
            Cancel
          </UiButton>
          <UiButton type="submit" :loading="creating" :disabled="!isFormValid">
            Create
          </UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>
