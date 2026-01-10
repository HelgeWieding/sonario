import type {
  FeatureRequest,
  FeatureRequestWithFeedback,
  CreateFeatureRequestInput,
  UpdateFeatureRequestInput,
} from "~~/shared/types";
import type { Category, Status } from "~~/shared/constants";

interface FetchFeatureRequestsOptions {
  productId: string;
  productSlug: string;
  status?: Status;
  category?: Category;
}

export function useFeatureRequests() {
  const requests = useState<FeatureRequest[]>("feature-requests", () => []);
  const loading = useState("feature-requests-loading", () => false);
  const error = useState<string | null>("feature-requests-error", () => null);

  async function fetchRequests(options: FetchFeatureRequestsOptions) {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.status) params.append("status", options.status);
      if (options.category) params.append("category", options.category);
      if (options.productId) params.append("productId", options.productId);

      const queryString = params.toString();
      const url = `/api/${options.productSlug}/feature-requests${
        queryString ? `?${queryString}` : ""
      }`;
      const { data } = await $fetch<{ data: FeatureRequest[] }>(url);
      requests.value = data;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to fetch feature requests";
    } finally {
      loading.value = false;
    }
  }

  async function getRequest(
    id: string
  ): Promise<FeatureRequestWithFeedback | null> {
    try {
      const { data } = await $fetch<{ data: FeatureRequestWithFeedback }>(
        `/api/feature-requests/${id}`
      );
      return data;
    } catch {
      return null;
    }
  }

  async function createRequest(
    slug: string,
    input: CreateFeatureRequestInput
  ): Promise<FeatureRequest | null> {
    try {
      const { data } = await $fetch<{ data: FeatureRequest }>(
        `/api/${slug}/feature-requests`,
        {
          method: "POST",
          body: input,
        }
      );
      requests.value = [data, ...requests.value];
      return data;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to create feature request";
      return null;
    }
  }

  async function updateRequest(
    id: string,
    input: UpdateFeatureRequestInput
  ): Promise<FeatureRequest | null> {
    try {
      const { data } = await $fetch<{ data: FeatureRequest }>(
        `/api/feature-requests/${id}`,
        {
          method: "PUT",
          body: input,
        }
      );
      requests.value = requests.value.map((r) => (r.id === id ? data : r));
      return data;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to update feature request";
      return null;
    }
  }

  async function deleteRequest(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/feature-requests/${id}`, { method: "DELETE" });
      requests.value = requests.value.filter((r) => r.id !== id);
      return true;
    } catch (e: any) {
      error.value = e.data?.message || "Failed to delete feature request";
      return false;
    }
  }

  return {
    requests,
    loading,
    error,
    fetchRequests,
    getRequest,
    createRequest,
    updateRequest,
    deleteRequest,
  };
}
