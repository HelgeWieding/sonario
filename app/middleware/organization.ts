export default defineNuxtRouteMiddleware(async () => {
  const { fetchOrganizationData } = useOrganizationManagement()

  await fetchOrganizationData()
})
