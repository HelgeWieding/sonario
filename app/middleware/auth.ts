export default defineNuxtRouteMiddleware(async (to) => {
  const { isSignedIn, orgId } = useAuth()

  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/', '/post-auth-redirect']
  const isPublicRoute = publicRoutes.some(route => to.path === route || (route !== '/' && to.path.startsWith(route)))

  // Onboarding routes - allow access during onboarding flow
  const isOnboardingRoute = to.path.startsWith('/onboarding')

  // Auth callback routes
  const isAuthCallback = to.path.startsWith('/auth/')

  // Skip checks for public routes and auth callbacks
  if (isPublicRoute || isAuthCallback) {
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

  // For routes with orgSlug parameter, validate access
  const orgSlug = to.params.orgSlug as string | undefined
  if (orgSlug) {
    // The organization validation happens in the layout/page
    // because we need to fetch org data to validate membership
    // The middleware just ensures the user is authenticated
    return
  }
})
