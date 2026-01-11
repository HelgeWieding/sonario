export default defineNuxtRouteMiddleware((to) => {
  const { isSignedIn, orgId } = useAuth()

  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/']
  const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route))

  // Onboarding routes - allow access during onboarding flow
  const isOnboardingRoute = to.path.startsWith('/onboarding')

  // Skip checks for public routes
  if (isPublicRoute) {
    return
  }

  // Check authentication
  if (!isSignedIn.value) {
    return navigateTo('/sign-in')
  }

  // Skip org check for onboarding routes
  if (isOnboardingRoute) {
    return
  }

  // Check organization exists (from Clerk)
  if (!orgId.value) {
    return navigateTo('/onboarding/create-organization')
  }
})
