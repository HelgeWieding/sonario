<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "product"],
});

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const { product, fetchProductServer } = useProduct();

await fetchProductServer(slug);

interface ContactWithStats {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  feedbackCount: number;
  lastFeedbackAt: string | null;
}

const loading = ref(true);
const contacts = ref<ContactWithStats[]>([]);

async function loadContacts() {
  if (!product.value) return;
  loading.value = true;
  try {
    const { data } = await $fetch<{ data: ContactWithStats[] }>(
      `/api/${route.params.slug}/contacts`
    );
    contacts.value = data;
  } catch (error) {
    console.error("Failed to load contacts:", error);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  loadContacts()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Contacts</h1>
      <p class="text-gray-500 mt-1">People who have submitted feedback</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <div v-else-if="contacts.length === 0" class="text-center py-12">
      <div class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      </div>
      <p class="text-gray-500 mb-2">No contacts yet</p>
      <p class="text-sm text-gray-400">
        Contacts will appear here when feedback is received from emails or conversations.
      </p>
    </div>

    <!-- Contacts list -->
    <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Feedback
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Activity
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="contact in contacts" :key="contact.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">
                  {{ contact.name || contact.email }}
                </div>
                <div v-if="contact.name" class="text-sm text-gray-500">
                  {{ contact.email }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ contact.feedbackCount }} {{ contact.feedbackCount === 1 ? 'item' : 'items' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(contact.lastFeedbackAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink
                :to="`/${product?.slug}/contacts/${contact.id}`"
                class="text-blue-600 hover:text-blue-900"
              >
                View
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
  </div>
</template>
