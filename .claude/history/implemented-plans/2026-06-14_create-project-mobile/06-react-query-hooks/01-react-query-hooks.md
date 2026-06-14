# Plan 06 — Port generic React Query hooks to project-mobile

## Context

Port the four generic data-fetching hooks from `project-web/src/layout/hooks/` into
`project-mobile/src/layout/hooks/`. They wrap `@tanstack/react-query` and the shared API
client and are fully platform-agnostic (no DOM, no web-only APIs), so they port as a
near-intact copy from web. The only changes are the import sources, which must resolve
against the mobile project's API layer (plan 04).

These generic hooks are the foundation consumed by the specialized per-domain data hooks
(plan 08) and the global stores (plan 07).

### Verified facts (from reading the web source)

- All four web hooks live in `project-web/src/layout/hooks/`:
  `use-api-request.ts`, `use-api-paginated.ts`, `use-api-cursor-paginated.ts`,
  `use-api-mutation.ts`.
- Imports actually used by the web hooks:
  - `authClient` from `@/api/client` (used by `use-api-request`, `use-api-paginated`,
    `use-api-cursor-paginated`; **not** by `use-api-mutation`).
  - `Pagination` type from `@/api/types` (used by `use-api-paginated`).
  - `CursorPaginationResponse` type from `@/api/types` (used by `use-api-cursor-paginated`).
  - `useQuery` / `useQueryClient` / `useInfiniteQuery` / `useMutation` from
    `@tanstack/react-query`.
  - `useState` from `react` (used by `use-api-paginated`).
- `@/api/types` (web `project-web/src/api/types.ts`) defines `Pagination<T>`
  (`{ items, page, totalItems }`) and `CursorPaginationResponse<T>`
  (`{ items, hasMore, nextCursor }`).
- Web uses the `@/*` -> `./src/*` path alias (tsconfig.app.json). The same alias is
  assumed available in mobile (configured by the scaffold).
- `use-api-mutation.ts` has **no API-layer import** at all — it is a pure
  `@tanstack/react-query` wrapper and copies byte-for-byte.

### Dependencies

- **Plan 04 (API layer)** must already expose, in `project-mobile/src/api/`:
  - `client.ts` exporting `authClient` (an axios-like client with `.get<T>(url, { params })`
    returning `{ data }`).
  - `types.ts` exporting `Pagination<T>` and `CursorPaginationResponse<T>`.
- **Scaffold** owns the `QueryClientProvider` / `queryClient` wiring. This plan must NOT
  create or modify any provider.

## Scope / owned files (parallel-safe)

This unit touches **only** these four files; nothing else:

- `project-mobile/src/layout/hooks/use-api-request.ts`
- `project-mobile/src/layout/hooks/use-api-paginated.ts`
- `project-mobile/src/layout/hooks/use-api-cursor-paginated.ts`
- `project-mobile/src/layout/hooks/use-api-mutation.ts`

Does not overlap plan 07 (`src/layout/stores/`, `use-connectivity.ts`).

## Import path adjustments

The mobile API layer reuses the web envelope-type names and client export. Because the web
hooks already import via the `@/api/*` alias, **no import strings change** as long as plan
04 keeps the same alias and the same export names:

| Symbol | Web import | Mobile import |
| --- | --- | --- |
| `authClient` | `@/api/client` | `@/api/client` (unchanged) |
| `Pagination` | `@/api/types` | `@/api/types` (unchanged) |
| `CursorPaginationResponse` | `@/api/types` | `@/api/types` (unchanged) |

If plan 04's mobile API places the pagination types under a different module name, update
the two `import type ... from "@/api/types"` lines accordingly. Confirm at implementation
time by checking `project-mobile/src/api/types.ts` (or equivalent) exists and exports both
`Pagination` and `CursorPaginationResponse`; if not, that is a plan-04 gap, not a fix to
make here.

## Implementation steps

### Step 1 — Create `use-api-request.ts`

Path: `project-mobile/src/layout/hooks/use-api-request.ts`

Copy intact from web. Final content:

```typescript
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
```

### Step 2 — Create `use-api-paginated.ts`

Path: `project-mobile/src/layout/hooks/use-api-paginated.ts`

Copy intact from web (offset pagination; `useState`-driven `currentPage`; `nextPage`
bounded by `Math.ceil(totalItems / limit)`, `previousPage` bounded at page 1). Final
content:

```typescript
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "@/api/client";
import type { Pagination } from "@/api/types";

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
```

### Step 3 — Create `use-api-cursor-paginated.ts`

Path: `project-mobile/src/layout/hooks/use-api-cursor-paginated.ts`

Copy intact from web (cursor/infinite pagination; flattens `data.pages` into `items`;
`getNextPageParam` returns `nextCursor` when `hasMore`, else `undefined`). This drives the
chat message list / inverted FlatList in mobile, but the hook itself has no RN coupling.
Final content:

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { authClient } from "@/api/client";
import type { CursorPaginationResponse } from "@/api/types";

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
```

### Step 4 — Create `use-api-mutation.ts`

Path: `project-mobile/src/layout/hooks/use-api-mutation.ts`

Copy byte-for-byte from web (no API-layer import; pure react-query wrapper exposing
`actions.mutate` (= `mutateAsync`), `actions.reset`, and `state.isPending/isError/error`).
Final content:

```typescript
import { useMutation } from "@tanstack/react-query";

interface UseAPIMutationProps<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
}

export function useAPIMutation<TVariables, TData>({
  mutationFn,
}: UseAPIMutationProps<TVariables, TData>) {
  const { mutateAsync, isPending, isError, error, reset } = useMutation<
    TData,
    Error,
    TVariables
  >({
    mutationFn,
  });

  return {
    actions: {
      mutate: mutateAsync,
      reset,
    },
    state: {
      isPending,
      isError,
      error,
    },
  };
}
```

## Conventions check (skills)

- One export per file, no barrel/index re-export files (per memory: "No export-only
  files"). Each hook is imported from its concrete module path.
- `{ state, actions }` two-key return shape is preserved exactly (per the API Data Hooks
  pattern); consumers in plans 07/08 destructure `{ state, actions }`.
- No comments added; self-explanatory code matching web verbatim.

## Out of scope / do NOT do

- Do NOT create or modify `QueryClientProvider` / `queryClient` (scaffold owns it).
- Do NOT create the specialized `use{Domain}{Action}Data` hooks (plan 08).
- Do NOT touch `src/layout/stores/` or `use-connectivity.ts` (plan 07).
- Do NOT create an `index.ts`/barrel for the hooks folder.
- No formatting/lint step is required for this plan.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with no errors. The key things tsc validates here:

- `@/api/client` resolves and exports `authClient` with a generic `.get<T>` returning
  `{ data: T }`.
- `@/api/types` resolves and exports `Pagination<T>` and `CursorPaginationResponse<T>`.
- `@tanstack/react-query` is installed in the mobile project (provided by scaffold) and its
  v5 API (`initialPageParam`, `getNextPageParam`, `mutateAsync`) is available.

If tsc fails on the `@/api/*` imports, that indicates plan 04 (API layer) is not yet in
place or uses different export names — surface it as a dependency gap rather than altering
these hooks.
```
