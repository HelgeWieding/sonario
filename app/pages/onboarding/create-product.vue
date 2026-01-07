<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: ["auth"],
});

const router = useRouter();
const { error, createProduct } = useProduct();
const { orgId } = useAuth();

// If no org, redirect to create-organization
if (!orgId.value) {
  navigateTo("/onboarding/create-organization");
}

const productName = ref("");
const description = ref("");
const creating = ref(false);

const isFormValid = computed(() => productName.value.trim().length > 0);

async function handleSubmit() {
  if (!isFormValid.value || !orgId.value) return;

  creating.value = true;
  const result = await createProduct({
    name: productName.value.trim(),
    description: description.value.trim() || undefined,
    organizationId: orgId.value,
  });
  creating.value = false;

  if (result) {
    router.push("/dashboard");
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-8">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Create Your First Product</h2>
      <p class="mt-2 text-sm text-gray-600">
        Set up a product to start collecting feature requests.
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          id="name"
          v-model="productName"
          type="text"
          required
          placeholder="My Awesome Product"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">
          Description
          <span class="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          v-model="description"
          rows="3"
          placeholder="A brief description of your product..."
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div v-if="error" class="text-sm text-red-600">
        {{ error }}
      </div>

      <UiButton
        type="submit"
        class="w-full"
        :loading="creating"
        :disabled="!isFormValid"
      >
        Create Product
      </UiButton>
    </form>
  </div>
</template>
