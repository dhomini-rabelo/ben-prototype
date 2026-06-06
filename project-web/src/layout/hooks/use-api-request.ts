import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/api/client";

interface UseAPIRequestProps {
  url: string;
  params?: Record<string, unknown>;
  enabled?: boolean;
}

export function useAPIRequest<T>({ url, params, enabled }: UseAPIRequestProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery<T>({
    queryKey: [url, params],
    queryFn: async () => {
      const response = await authClient.get<T>(url, { params });
      return response.data;
    },
    enabled: enabled ?? true,
    retryDelay: 5 * 1000,
    staleTime: 60 * 5 * 1000,
  });

  return {
    actions: {
      refetch,
      invalidate: () => queryClient.invalidateQueries({ queryKey: [url, params] }),
    },
    state: {
      data,
      isLoading,
      isError,
      error,
    },
  };
}
