import { useInfiniteQuery } from "@tanstack/react-query";
import { authClient } from "../../api/client";
import type { CursorPaginationResponse } from "../../api/types";

interface UseAPICursorPaginatedProps {
  url: string;
  limit?: number;
}

export function useAPICursorPaginated<T>({
  url,
  limit = 20,
}: UseAPICursorPaginatedProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<CursorPaginationResponse<T>>({
    queryKey: [url, limit],
    queryFn: async ({ pageParam }) => {
      const response = await authClient.get<CursorPaginationResponse<T>>(url, {
        params: { limit, cursor: pageParam ?? undefined },
      });
      return response.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    retryDelay: 5 * 1000,
    staleTime: 60 * 5 * 1000,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    actions: {
      fetchNextPage,
      refetch,
    },
    state: {
      items,
      hasMore: Boolean(hasNextPage),
      isLoading,
      isFetchingNextPage,
      isError,
      error,
    },
  };
}
