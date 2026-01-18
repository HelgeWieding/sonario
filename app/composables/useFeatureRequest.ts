import type {
  FeatureRequestWithFeedback,
  UpdateFeatureRequestInput,
} from "~~/shared/types";

export function useFeatureRequest() {
  const route = useRoute();
  const slug = computed(() => route.params.productSlug as string);
  const requestId = computed(() => route.params.requestId as string);

  // Global state using useState
  const request = useState<FeatureRequestWithFeedback | null>(
    "feature-request",
    () => null,
  );
  const loading = useState<boolean>("feature-request-loading", () => false);
  const error = useState<string | null>("feature-request-error", () => null);

  // Client-side fetch - must be called explicitly
  async function fetchFeatureRequestClient() {
    if (!slug.value || !requestId.value) return;

    loading.value = true;
    error.value = null;

    try {
      const { data } = await $fetch<{ data: FeatureRequestWithFeedback }>(
        `/api/${slug.value}/feature-requests/${requestId.value}`,
      );
      request.value = data;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to fetch feature request";
      request.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function updateRequest(
    input: UpdateFeatureRequestInput,
  ): Promise<boolean> {
    if (!slug.value || !requestId.value) return false;

    try {
      const { data } = await $fetch<{ data: FeatureRequestWithFeedback }>(
        `/api/${slug.value}/feature-requests/${requestId.value}`,
        {
          method: "PUT",
          body: input,
        },
      );
      request.value = data;
      return true;
    } catch {
      return false;
    }
  }

  async function deleteRequest(): Promise<boolean> {
    if (!slug.value || !requestId.value) return false;

    try {
      const { data } = await $fetch(
        `/api/${slug.value}/feature-requests/${requestId.value}`,
        {
          method: "DELETE",
        },
      );
      request.value = null;
      return data.success;
    } catch {
      return false;
    }
  }

  // Clear state when leaving page
  function clearRequest() {
    request.value = null;
    error.value = null;
    loading.value = false;
  }

  return {
    request,
    loading,
    error,
    fetchFeatureRequestClient,
    updateRequest,
    deleteRequest,
    clearRequest,
  };
}
