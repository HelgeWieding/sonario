<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: ["auth"],
});

const router = useRouter();
const { orgId } = useAuth();

// If user already has an org, redirect to create-product
watch(
  orgId,
  (newOrgId) => {
    if (newOrgId) {
      router.push("/onboarding/create-product");
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="bg-white rounded-lg shadow p-8">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Create Your Organization</h2>
      <p class="mt-2 text-sm text-gray-600">
        Set up your organization to get started with Meeyo.
      </p>
    </div>

    <CreateOrganization
      :after-create-organization-url="'/onboarding/create-product'"
    />
  </div>
</template>
