<script setup lang="ts">
const route = useRoute();
const { isSignedIn } = useAuth();
const { fetchOrganizationData, orgData } = useOrganizationManagement();
const { selectedProduct, selectProductBySlug, fetchProductsWithRedirect } =
    useProducts();
const { validateOrgAccess } = useOrgSlug();

// Modal container for teleportation
const modalContainer = ref<HTMLElement | null>(null);
provideModalContainer(modalContainer);

// Fetch organization data server-side
await fetchOrganizationData();

// Validate org access if orgSlug is in URL
const urlOrgSlug = computed(() => route.params.orgSlug as string | undefined);
watch(
    [urlOrgSlug, orgData],
    () => {
        if (urlOrgSlug.value && orgData.value) {
            const hasAccess = validateOrgAccess();
            if (!hasAccess) {
                // User doesn't have access to this org - show 404
                throw createError({
                    statusCode: 404,
                    statusMessage: "Organization not found",
                    fatal: true,
                });
            }
        }
    },
    { immediate: true },
);

// Fetch products (redirect to create-product if empty)
await fetchProductsWithRedirect();

// Redirect to sign-in if not authenticated
watch(
    isSignedIn,
    (signedIn) => {
        if (!signedIn) {
            navigateTo("/sign-in");
        }
    },
    { immediate: true },
);

// Sync selectedProduct with route productSlug
watch(
    () => route.params.productSlug,
    (newSlug) => {
        if (typeof newSlug === "string" && newSlug) {
            if (selectedProduct.value?.slug !== newSlug) {
                selectProductBySlug(newSlug);
            }
        }
    },
    { immediate: true },
);
</script>

<template>
    <div class="min-h-screen bg-white">
        <LayoutAppHeader />
        <div class="flex">
            <LayoutAppSidebar />
            <main class="flex-1 p-8">
                <div class="max-w-6xl">
                    <slot />
                </div>
            </main>
        </div>
        <!-- Modal container for teleportation -->
        <div ref="modalContainer" id="modal-container" />
    </div>
</template>
