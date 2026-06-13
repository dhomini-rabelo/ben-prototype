# Mobile Token Persistence Structure

How `project-mobile` persists auth state in `src/storage/`. Sensitive tokens and ordinary user data are split across **two native stores**, and the token store keeps an **in-memory synchronous cache** so a synchronous axios interceptor can read a token from an otherwise async-only API. **All file and folder names use kebab-case.**

## Folder layout

```
src/
└── storage/
    ├── token-storage.ts   # SecureStore (expo-secure-store): JWT + provider token, with sync cache
    └── user-storage.ts    # AsyncStorage: the StoredUser profile
```

- **Secrets** (JWT, provider token) go in `token-storage.ts`, backed by `expo-secure-store`.
- **Non-secret profile data** (the `StoredUser`) goes in `user-storage.ts`, backed by `@react-native-async-storage/async-storage`.
- Both native APIs are async, so every persisted read/write is an `async` function.

## The synchronous cache problem

The axios request interceptor is **synchronous** — it must return a token immediately — but `SecureStore` is **async-only**. The token store solves this by mirroring the secure values into module-level variables:

```ts
let cachedToken: string | null = null

export async function loadTokenIntoMemory(): Promise<void> {
  cachedToken = await readSecure()       // async: hydrate the cache at startup
}

export function getCachedToken(): string | null {
  return cachedToken                     // sync: safe to call from the interceptor
}

export async function setStoredToken(token: string): Promise<void> {
  cachedToken = token                    // keep cache and store in lockstep
  await writeSecure(token)
}
```

- `loadTokenIntoMemory()` hydrates the cache once and is called by bootstrap at startup before any request fires.
- `getCached*()` are **synchronous** and are the only token accessors the interceptor uses.
- Every write (`setStored*`, `clearStored*`, and the 401 / token-refresh paths) updates the cache **and** the secure store together so they never drift.

## Consumers

- The API client reads tokens synchronously via `getCached*()` in its request interceptor and updates them on refresh / 401.
- Bootstrap calls `loadTokenIntoMemory()` before marking the app ready, then hydrates the user from `user-storage.ts`.
