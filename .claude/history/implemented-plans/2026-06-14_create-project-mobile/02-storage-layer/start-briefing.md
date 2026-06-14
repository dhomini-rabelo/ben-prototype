# Plan 02 — Storage layer (SecureStore + AsyncStorage)

**Plan 2 [Frontend] (parallel)**: Platform token/user persistence layer.

- Depends only on the scaffold (plan 01). Owns its own `src/storage/` directory, touched by no other plan, so it runs in parallel with plan 03 (design tokens + utils). The API client (plan 04) and the auth flow (plan 09) consume this module later.

## Goal

Replace `js-cookie` with native persistence per the analysis: JWT token in **`expo-secure-store`**, user object in **`@react-native-async-storage/async-storage`**. Because SecureStore is **async**, expose both an async API and an in-memory cached token getter so the axios interceptor can read the token synchronously after boot.

## Scope / owned files

- `project-mobile/src/storage/token-storage.ts`
  - `getStoredToken(): Promise<string | null>`, `setStoredToken(token)`, `clearStoredToken()` over SecureStore (keys `@ben/jwttoken`, `@ben/authprovidertoken`).
  - In-memory cache: `loadTokenIntoMemory(): Promise<void>` (called on boot), `getCachedToken(): string | null`, `setCachedToken(token)` — so the interceptor stays synchronous.
- `project-mobile/src/storage/user-storage.ts`
  - `getStoredUser(): Promise<User | null>`, `setStoredUser(user)`, `clearStoredUser()` over AsyncStorage (key `@ben/user`). Uses the `User` model from `src/api/models/user.ts` (created by plan 04 — type-only import; if not yet present, define a minimal local type and let plan 04's model supersede via re-export note).

## Note on the User type dependency

To avoid a cross-parallel dependency on plan 04, type the user as a structural type local to storage OR import the type lazily. Prefer importing `import type { User } from "@/api/models/user"` since type-only imports do not create a runtime ownership conflict and plan 04 runs in a later slot is **false** — plan 04 is also plan-3. **Resolution:** keep `user-storage` generic over a `StoredUser` shape it defines itself; the auth store (plan 07) maps `User` ↔ `StoredUser`. This keeps storage free of any parallel-plan dependency.

## Verification

`npx tsc --noEmit` passes.
