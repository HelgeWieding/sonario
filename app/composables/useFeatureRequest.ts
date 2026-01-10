import type {
  FeatureRequestWithFeedback,
  UpdateFeatureRequestInput,
} from "~~/shared/types";

export function useFeatureRequest() {
  const route = useRoute();
  const slug = computed(() => route.params.slug as string);
  const requestId = computed(() => route.params.requestId as string);

  const {
    data: request,
    status,
    error,
    refresh,
  } = useAsyncData<FeatureRequestWithFeedback | null>(
    `feature-request-${requestId.value}`,
    async () => {
      if (!slug.value || !requestId.value) return null;

      try {
        const { data } = await $fetch<{ data: FeatureRequestWithFeedback }>(
          `/api/${slug.value}/feature-requests/${requestId.value}`
        );
        return data;
      } catch {
        return null;
      }
    },
    {
      watch: [slug, requestId],
    }
  );

  const loading = computed(() => status.value === "pending");

  async function updateRequest(
    input: UpdateFeatureRequestInput
  ): Promise<boolean> {
    if (!slug.value || !requestId.value) return false;

    try {
      const { data } = await $fetch<{ data: FeatureRequestWithFeedback }>(
        `/api/${slug.value}/feature-requests/${requestId.value}`,
        {
          method: "PUT",
          body: input,
        }
      );
      request.value = data;
      return true;
    } catch {
      return false;
    }
  }

  async function deleteRequest(): Promise<boolean> {
    try {
      const { data } = await $fetch(
        `/api/${slug.value}/feature-requests/${requestId.value}`,
        {
          method: "DELETE",
        }
      );
      request.value = null;
      return data.success;
    } catch {
      return false;
    }
  }

  return {
    request,
    loading,
    error,
    refresh,
    updateRequest,
    deleteRequest,
  };
}
