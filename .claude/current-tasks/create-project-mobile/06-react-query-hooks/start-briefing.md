# Plan 06 — Generic React Query hooks

**Plan 4 [Frontend] (parallel)**: Port the generic data-fetching hooks.

- Depends on the API layer (plan 04). Owns the generic hook files under `src/layout/hooks/` (`use-api-*.ts`), distinct from plan 07 (global stores), which owns `src/layout/stores/` + `use-connectivity.ts`. They share the `src/layout/hooks/` directory but never the same file, so they run in parallel.

## Goal

Port the generic React Query hooks (they work in RN unchanged): single request, offset pagination, cursor pagination, mutation. These are consumed by the specialized data hooks (plan 08) and stores.

## Scope / owned files

- `project-mobile/src/layout/hooks/use-api-request.ts` — `useAPIRequest<T>()`.
- `project-mobile/src/layout/hooks/use-api-paginated.ts` — `useAPIPaginated<T>()` (offset).
- `project-mobile/src/layout/hooks/use-api-cursor-paginated.ts` — `useAPICursorPaginated<T>()` (cursor; used by chat message list / FlatList).
- `project-mobile/src/layout/hooks/use-api-mutation.ts` — `useAPIMutation<TVariables, TData>()`.

Copy intact from web; only adjust imports (`@/api/client`). Do **not** touch the `QueryClientProvider` (owned by scaffold).

## Verification

`npx tsc --noEmit` passes.
