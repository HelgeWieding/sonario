export default defineNuxtRouteMiddleware((to) => {
  const { isSignedIn } = useAuth()

  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/']

  if (!isSignedIn.value && !publicRoutes.some(route => to.path.startsWith(route))) {
    return navigateTo('/sign-in')
  }
})
