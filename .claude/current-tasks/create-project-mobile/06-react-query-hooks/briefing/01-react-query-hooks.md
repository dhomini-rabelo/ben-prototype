# Plan 06 — Port generic React Query hooks to project-mobile

These hooks are platform-agnostic (only `@tanstack/react-query`, `react`, and the API
layer). They port as a near-intact copy from web; the only adjustment is keeping the
`@/api/*` import alias resolving correctly under the mobile setup. This unit owns only the
generic `src/layout/hooks/use-api-*.ts` files and must not touch `QueryClientProvider`.

## Plan

1. **Confirm prerequisites are in place**
   - Verify the API layer (plan 04) is available, since every hook depends on the shared
     HTTP client and the pagination response types it exports.
   - Confirm the React Query provider already exists in the app shell (owned by the
     scaffold) so the ported hooks have a query context to run inside.

2. **Port the single-request hook**
   - Recreate the generic "fetch one resource" hook that wraps a query with caching,
     retry delay, and stale-time behavior.
   - Preserve its public shape: configurable URL, params, and enabled flag, returning
     grouped `actions` (refetch, invalidate) and `state` (data, loading, error).

3. **Port the offset-pagination hook**
   - Recreate the page-number-based listing hook with initial page and page-size inputs.
   - Keep its navigation behavior intact: set page, next page (bounded by total items),
     and previous page (bounded at the first page), exposing current page plus loading
     and error state.

4. **Port the cursor-pagination hook**
   - Recreate the cursor-based infinite-listing hook used by the chat message list.
   - Preserve flattening of pages into a single item list, the has-more / next-cursor
     logic, and the fetch-next-page and refetch actions, so it drives an inverted
     virtualized list cleanly.

5. **Port the mutation hook**
   - Recreate the generic mutation wrapper that takes a caller-supplied mutation function.
   - Keep its returned `actions` (mutate, reset) and `state` (pending, error) unchanged so
     downstream specialized hooks consume it identically to web.

6. **Verify the port**
   - Ensure all four hooks resolve their shared imports and that the type checker passes
     with no errors.
