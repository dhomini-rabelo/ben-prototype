# Plan 02 — Storage layer (expo-secure-store token + in-memory cache + AsyncStorage user)

Deep, code-level implementation plan for the `project-mobile` native persistence layer. **Implementation plan only — do not implement yet.**

## Context

- `project-mobile` does not exist yet; it is scaffolded by **plan 01**, which establishes the managed-workflow Expo app, the `@/` path alias pointing at `src/`, strict TypeScript, and declares the dependency set (including `expo-secure-store` and `@react-native-async-storage/async-storage`). This plan assumes that scaffold is in place.
- The web app persists auth state in browser cookies via `js-cookie`:
  - `src/api/client.ts` — JWT under `@ben/jwttoken` and provider token under `@ben/authprovidertoken`, read **synchronously** in the axios request interceptor (`Cookies.get(...)`), refreshed from the `updatedjwtauthenticationtoken` response header, and both removed on a 401.
  - `src/layout/stores/auth-store.ts` — user object under `@ben/user`, read synchronously at store init (`readStoredUser`) and JSON-parsed with a try/catch fallback to `null`.
- Per `MOBILE-PORT-ANALYSIS.md` (rows for "Storage de token" and rewrite point #1): cookie → `expo-secure-store` for the two tokens (sensitive) + `@react-native-async-storage/async-storage` for the user object. SecureStore is **async**, so the synchronous interceptor needs an in-memory token cache loaded once at boot.

## Goal

Provide native persistence for the auth tokens and the authenticated user, reusing the web key names verbatim for parity, and expose a **synchronous** cached-token getter so the future axios interceptor (plan 04) and auth flow (plan 09) never block on async secure storage.

## Scope / owned files (parallel-safe)

This plan touches **only** `project-mobile/src/storage/`:

- `project-mobile/src/storage/token-storage.ts` — secure token persistence + in-memory cache.
- `project-mobile/src/storage/user-storage.ts` — user persistence over AsyncStorage with a self-contained `StoredUser` shape.

No other directory is touched. No `index.ts` barrel (memory rule: no export-only files; consumers import the concrete module directly).

## Key design decisions

1. **Two storage backends, two files.** Tokens are secrets → `expo-secure-store`. The user object is non-sensitive display data and can exceed SecureStore's value-size guidance → `AsyncStorage`. This mirrors the web split (token client vs. auth store) and the analysis decision.

2. **Reuse web key names verbatim.** `@ben/jwttoken`, `@ben/authprovidertoken`, `@ben/user`. SecureStore keys must match `[A-Za-z0-9._-]`; `@ben/jwttoken` contains `@` and `/`, which are **not** valid SecureStore key characters and will throw at runtime. To preserve the conceptual parity required by the brief while staying valid, keep the web-facing constant names but sanitize to a SecureStore-safe physical key via a small mapping. AsyncStorage has no such restriction, so the user key stays exactly `@ben/user`. (See "SecureStore key constraint" below — this is the one place we cannot copy the web string byte-for-byte.)

3. **Synchronous cached token getter.** `loadTokenIntoMemory()` runs once at boot (called by plan 01's root layout / plan 09's auth bootstrap). After that, `getCachedToken()` / `getCachedProviderToken()` return instantly. Every write/clear path updates the cache in the same call so the interceptor never reads a stale value.

4. **Self-contained `StoredUser` shape.** `user-storage.ts` defines its own `StoredUser` interface (structurally identical to web's `src/api/models/user.ts`: `id`, `name`, `username`, `email`, `avatarUrl`, `providerId`). It does **not** import the `User` model owned by plan 04. The auth store (plan 07) owns the `User` ↔ `StoredUser` mapping. This removes any cross-parallel-plan dependency.

5. **Graceful reads.** Missing or unparseable stored values resolve to `null` instead of throwing, exactly like web's `readStoredUser` try/catch.

## SecureStore key constraint (important)

`expo-secure-store` rejects keys containing characters outside `[A-Za-z0-9._-]` (it throws `Invalid key provided`). The web cookie key `@ben/jwttoken` contains `@` and `/`. Therefore:

- We keep the **public, web-parity constant** (`JWT_TOKEN_KEY = "@ben/jwttoken"`) for documentation/parity and for any consumer that wants the canonical name.
- We map it to a **SecureStore-safe physical key** (`ben.jwttoken`) used for the actual `setItemAsync`/`getItemAsync`/`deleteItemAsync` calls.

This is the single deviation from byte-for-byte web parity, forced by the platform. The user key (`@ben/user`) is stored as-is in AsyncStorage, which accepts arbitrary string keys, so it stays identical to web.

## File 1 — `project-mobile/src/storage/token-storage.ts`

```typescript
import * as SecureStore from "expo-secure-store";

export const JWT_TOKEN_KEY = "@ben/jwttoken";
export const PROVIDER_TOKEN_KEY = "@ben/authprovidertoken";

const SECURE_KEYS = {
  [JWT_TOKEN_KEY]: "ben.jwttoken",
  [PROVIDER_TOKEN_KEY]: "ben.authprovidertoken",
} as const;

let cachedJwtToken: string | null = null;
let cachedProviderToken: string | null = null;

async function readSecure(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS[key]);
  } catch {
    return null;
  }
}

async function writeSecure(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEYS[key], value);
}

async function deleteSecure(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_KEYS[key]);
}

export async function getStoredToken(): Promise<string | null> {
  return readSecure(JWT_TOKEN_KEY);
}

export async function getStoredProviderToken(): Promise<string | null> {
  return readSecure(PROVIDER_TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  cachedJwtToken = token;
  await writeSecure(JWT_TOKEN_KEY, token);
}

export async function setStoredProviderToken(token: string): Promise<void> {
  cachedProviderToken = token;
  await writeSecure(PROVIDER_TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  cachedJwtToken = null;
  cachedProviderToken = null;
  await Promise.all([
    deleteSecure(JWT_TOKEN_KEY),
    deleteSecure(PROVIDER_TOKEN_KEY),
  ]);
}

export async function loadTokenIntoMemory(): Promise<void> {
  const [jwt, provider] = await Promise.all([
    getStoredToken(),
    getStoredProviderToken(),
  ]);
  cachedJwtToken = jwt;
  cachedProviderToken = provider;
}

export function getCachedToken(): string | null {
  return cachedJwtToken;
}

export function getCachedProviderToken(): string | null {
  return cachedProviderToken;
}

export function setCachedToken(token: string | null): void {
  cachedJwtToken = token;
}

export function setCachedProviderToken(token: string | null): void {
  cachedProviderToken = token;
}
```

### Notes on File 1

- **Brief mapping.** The brief lists `getStoredToken`, `setStoredToken`, `clearStoredToken`, `loadTokenIntoMemory`, `getCachedToken`, `setCachedToken`. Those are all present. The provider-token siblings (`getStoredProviderToken`, `setStoredProviderToken`, `getCachedProviderToken`, `setCachedProviderToken`) are added because the web interceptor sends **both** `jwtauthenticationtoken` and `providerauthenticationtoken` headers and the 401 path clears **both** — the storage layer must cover both for plan 04 to be a faithful port. `clearStoredToken` clears both together (matching the web 401 behavior that removes both cookies), satisfying brief item "Clear both tokens together when the session ends".
- **`setStoredToken` / `setStoredProviderToken` keep the cache in sync** by writing the cache before awaiting the secure write, so a consumer calling `getCachedToken()` immediately after sees the new value. This satisfies brief item "Keep the cache in sync whenever the token is written or cleared".
- **`setCachedToken(null)` is allowed** (signature widened to `string | null`) so plan 04's response-refresh path and plan 09's logout can update the cache directly without a storage round-trip if needed. This is a small superset of the brief's `setCachedToken(token)`; it does not break the requested signature.
- **`readSecure` try/catch** mirrors web's graceful `?? ""` / `null` fallbacks — a corrupt/empty keychain entry resolves to `null` rather than throwing, keeping boot resilient.
- **No top-level `await`.** `loadTokenIntoMemory()` is an explicit boot step invoked by plan 01/09, not module-load side-effect — consistent with React Native module semantics and avoids ordering surprises.

## File 2 — `project-mobile/src/storage/user-storage.ts`

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

export const USER_KEY = "@ben/user";

export interface StoredUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  providerId: string;
}

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearStoredUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}
```

### Notes on File 2

- **`StoredUser` is self-contained** — its fields mirror web's `src/api/models/user.ts` (`id`, `name`, `username`, `email`, `avatarUrl: string | null`, `providerId`) but it is declared here, with **no import of plan 04's `User` model**. This satisfies brief item 4 ("Keep the user shape independent of other in-progress work") and removes the cross-parallel dependency the brief explicitly flagged. Plan 07's auth store will map `User` ↔ `StoredUser`.
- **`getStoredUser` try/catch** ports web's `readStoredUser`: missing key → `null`, unparseable JSON → `null`, never throws (brief item 3, "Recover gracefully").
- **AsyncStorage keeps the literal `@ben/user` key** — no sanitization needed, full parity with web's `USER_COOKIE`.
- **No cookie expiry equivalent.** Web sets `{ expires: 5 }` days on the user cookie; AsyncStorage has no TTL. Session lifetime is governed by the JWT/refresh flow (plan 04) and explicit logout clears (plan 09), so dropping the 5-day expiry is correct — the user object should persist as long as the token does.

## Conventions applied

- **kebab-case filenames** (`token-storage.ts`, `user-storage.ts`) — front-end code preferences.
- **Path alias** `@/` available for consumers (plan 04/07/09 will `import ... from "@/storage/token-storage"`); this layer itself imports only the two npm packages.
- **No barrel/index file** — memory rule "no export-only files"; each consumer imports the concrete module.
- **No comments**; self-explanatory names — code-write-code skill.
- **English identifiers**, named exports only, plain functions + module-level cache (no class) — matches the functional style of web's `client.ts`/`auth-store.ts`.

## Out of scope (owned by other plans)

- The axios clients and the request/response interceptors that *consume* `getCachedToken()` / `setStoredToken()` / `clearStoredToken()` — **plan 04** (`src/api/client.ts`).
- Calling `loadTokenIntoMemory()` at app boot and registering the 401 navigation callback — **plan 01** (root layout) / **plan 09** (auth flow).
- The `User` ↔ `StoredUser` mapping and the Zustand auth store — **plan 07**.
- The `User` model itself — **plan 04** (`src/api/models/user.ts`).

## Verification

From the `project-mobile` directory once it exists:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with no errors for the two owned files. (No formatting step, per instructions.)

### Verification caveat

`expo-secure-store` and `@react-native-async-storage/async-storage` are installed by plan 01. If this plan is type-checked **before** plan 01 has installed those packages, `tsc --noEmit` will report missing-module errors for the two imports. In that case, verification of this plan is satisfied by type-checking the two files in isolation against installed types; the full-project `tsc --noEmit` is the gate once plan 01 is merged.
