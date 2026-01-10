import type { Feedback } from "~~/shared/types";
import type { Sentiment } from "~~/shared/constants";

export interface AddFeedbackInput {
  content: string;
  senderEmail?: string;
  senderName?: string;
  sentiment?: Sentiment;
}

export function useFeedback() {
  const route = useRoute();
  const { product } = useProduct();

  const loading = useState("feedback-loading", () => false);
  const error = useState<string | null>("feedback-error", () => null);

  const productId = computed(() => product.value?.id);
  const featureRequestId = computed(
    () => route.params.requestId as string | undefined
  );

  async function getFeedback(): Promise<Feedback[]> {
    if (!featureRequestId.value) return [];

    try {
      const { data } = await $fetch<{ data: Feedback[] }>(
        `/api/feature-requests/${featureRequestId.value}/feedback`
      );
      return data;
    } catch {
      return [];
    }
  }

  async function addFeedback(
    input: AddFeedbackInput
  ): Promise<Feedback | null> {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await $fetch<{ data: Feedback }>(
        `/api/${route.params.slug}/feedback`,
        {
          method: "POST",
          body: {
            ...input,
            productId: productId.value,
            featureRequestId: featureRequestId.value,
          },
        }
      );
      return data;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to add feedback";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteFeedback(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/${route.params.slug}/feedback/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to delete feedback";
      return false;
    }
  }

  return {
    loading,
    error,
    getFeedback,
    addFeedback,
    deleteFeedback,
  };
}
