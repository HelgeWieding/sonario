<script setup lang="ts">
/**
 * Post-authentication redirect page
 * Handles redirecting users to the correct org-prefixed URL after sign-in
 */
definePageMeta({
  layout: false, // No layout needed for this redirect page
})

const { isSignedIn, isLoaded } = useAuth()
const router = useRouter()

async function handleRedirect() {
  // Wait for auth to be loaded
  if (!isLoaded.value) {
    return
  }

  // If not signed in, redirect to sign-in
  if (!isSignedIn.value) {
    await router.push('/sign-in')
    return
  }

  try {
    // Fetch the user's current organization
    const response = await $fetch<{ data: { organization: { slug: string } | null } }>('/api/organizations/current')
    const org = response.data?.organization

    if (org?.slug) {
      // Redirect to the org's dashboard
      await router.push(`/${org.slug}/dashboard`)
    } else {
      // No organization - redirect to onboarding
      await router.push('/onboarding/create-organization')
    }
  } catch (error) {
    console.error('Failed to fetch organization:', error)
    // On error, redirect to onboarding as fallback
    await router.push('/onboarding/create-organization')
  }
}

// Watch for auth loaded state and redirect
watch(isLoaded, (loaded) => {
  if (loaded) {
    handleRedirect()
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="text-center">
      <div class="animate-spin h-8 w-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-neutral-600">Redirecting...</p>
    </div>
  </div>
</template>
