import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "../../api/client";
import type { Pagination } from "../../api/types";

interface UseAPIPaginatedProps {
  url: string;
  initialPage?: number;
  limit?: number;
}

interface HookState {
  currentPage: number;
}

export function useAPIPaginated<T>({
  url,
  initialPage = 1,
  limit = 10,
}: UseAPIPaginatedProps) {
  const [state, setState] = useState<HookState>({
    currentPage: initialPage,
  });

  const { data, isLoading, isError, error } = useQuery<Pagination<T>>({
    queryKey: [url, state.currentPage, limit],
    queryFn: async () => {
      const response = await authClient.get<Pagination<T>>(url, {
        params: { page: state.currentPage, limit },
      });
      return response.data;
    },
    retryDelay: 5 * 1000,
    staleTime: 60 * 5 * 1000,
  });

  function setPage(page: number) {
    setState((previous) => ({ ...previous, currentPage: page }));
  }

  function nextPage() {
    if (data && state.currentPage < Math.ceil(data.totalItems / limit)) {
      setState((previous) => ({
        ...previous,
        currentPage: previous.currentPage + 1,
      }));
    }
  }

  function previousPage() {
    if (state.currentPage > 1) {
      setState((previous) => ({
        ...previous,
        currentPage: previous.currentPage - 1,
      }));
    }
  }

  return {
    actions: {
      setPage,
      nextPage,
      previousPage,
    },
    state: {
      data,
      currentPage: state.currentPage,
      isLoading,
      isError,
      error,
    },
  };
}
