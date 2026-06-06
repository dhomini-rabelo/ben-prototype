# Web API Client Structure

How the `project-web` backend API layer under `src/api/` is organized. **All file and folder names use kebab-case**; only exported identifiers follow their own casing.

## Folder layout

```
src/api/
├── client.ts                # axios clients + interceptors + queryClient
├── routes.ts                # API_ROUTES url map
├── types.ts                 # response envelope types (ItemResponse, ListingResponse, ...)
├── models/
│   └── {entity}.ts          # full entity shape
├── responses/
│   └── {entity}.ts          # list-item projections and operation-specific responses
└── requests/
    └── {feature}.ts         # request{Action} functions
```

## client.ts

`client.ts` creates the axios instances (`basicClient` for unauthenticated calls, `authClient` for authenticated calls) and the shared `queryClient`. The `authClient` carries auth concerns in interceptors: a request interceptor injects the token, and a response interceptor refreshes the token and redirects to login on `401`. Request functions never touch tokens directly.

```ts
export const authClient = axios.create({ baseURL: BASE_URL })

authClient.interceptors.request.use((config) => {
  config.headers.set('jwtauthenticationtoken', Cookies.get(JWT_COOKIE) ?? '')
  return config
})
```

## routes.ts

A single `API_ROUTES` const maps every endpoint, grouped by feature. Parameterized routes are functions.

```ts
export const API_ROUTES = {
  tasks: {
    list: '/tasks/list',
    detail: (taskId: string) => `/tasks/${taskId}/detail`,
  },
}
```

## models/ and responses/

`models/{entity}.ts` holds the **full** entity shape used by detail views; `responses/{entity}.ts` holds **list-item projections** (`{Entity}ListItem`) and operation-specific response shapes. Splitting them mirrors the backend's detail-vs-listing payloads and avoids over-typing list endpoints.

## requests/

`requests/{feature}.ts` holds one `request{Action}` async function per endpoint. Each function types the response with an envelope from `types.ts`, then returns the **unwrapped** payload so callers receive the entity directly.

```ts
export async function requestGetTaskDetail(taskId: string): Promise<Task> {
  const response = await authClient.get<ItemResponse<Task>>(
    API_ROUTES.tasks.detail(taskId),
  )

  return response.data.item
}
```
