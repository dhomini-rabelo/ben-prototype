# API Data Hook Patterns

How `project-web` consumes the backend API through hooks. The `api/` layer is covered by the [web API client structure](../../code-get-coding-designs/designs/web-api-client-structure.md) design; these patterns cover the hooks that wrap it.

## Return `{ state, actions }` from generic API hooks

- The generic hooks (`useAPIRequest`, `useAPIMutation`, `useAPIPaginated`, `useAPICursorPaginated`) wrap React Query and return a two-key object: `state` holds the data and flags (`data`, `isLoading`, `isError`, `error`), `actions` holds the callbacks (`refetch`, `invalidate`, `mutate`).
- Consumers destructure `{ state, actions }`, never the raw React Query result, so the shape stays uniform across the app.

```typescript
// Correct way
export function useAPIRequest<T>({ url, params, enabled }: UseAPIRequestProps) {
  const { data, isLoading, isError, error, refetch } = useQuery<T>({
    queryKey: [url, params],
    queryFn: async () => (await authClient.get<T>(url, { params })).data,
    enabled: enabled ?? true,
  })

  return {
    actions: { refetch, invalidate: () => {/* ... */} },
    state: { data, isLoading, isError, error },
  }
}
```

## Wrap each endpoint in a thin per-domain data hook

- Each endpoint gets a `use{Domain}{Action}Data` hook under `layout/hooks/api/` that binds the generic hook to the route and the typed response envelope, and nothing else. Components import the domain hook, not the generic one.

```typescript
// Correct way
export function useTaskDetailData(taskId: string) {
  return useAPIRequest<ItemResponse<Task>>({
    url: API_ROUTES.tasks.detail(taskId),
  })
}
```

## Gate fetching with `enabled`

- For requests that must not run until an input is ready (a detail hook with no id yet), forward an `enabled` flag instead of conditionally calling the hook.

```typescript
// Wrong way — conditional hook call breaks the rules of hooks
const data = taskId ? useTaskDetailData(taskId) : null

// Correct way
useAPIRequest<ItemResponse<Task>>({
  url: API_ROUTES.tasks.detail(taskId),
  enabled: Boolean(taskId),
})
```
