# Plan 07 — Implementation Plan: Global stores (auth / connectivity / menu) + connectivity hook

Deep, code-level plan for porting the platform-agnostic global Zustand stores and the
connectivity sync hook from `project-web` to `project-mobile`. **Do not implement yet** —
this is the plan only.

## Context & decisions

- This is **Plan 4 [Frontend] (parallel)**. It owns exactly four files and touches nothing else,
  so it can run alongside the generic hooks unit (plan 06).
- **Depends on** plan 02 (storage layer) and plan 04 (API models). Neither needs to be finished
  for this plan to be *typed*, but the symbols this plan imports must exist for `tsc` to pass — so
  in a real parallel run, the imports below assume those modules are present (they are owned by
  earlier/sibling slots).
- Per `MOBILE-PORT-ANALYSIS.md`:
  - `connectivity-store` and `menu-store` are **platform-agnostic** → copy intact (Zustand is
    agnostic).
  - `auth-store` swaps cookie persistence (`js-cookie`) for native storage; because device storage
    is **async**, initial state begins empty and hydrates once persistence resolves.
  - `use-connectivity` swaps `navigator.onLine` + browser events for
    **`@react-native-community/netinfo`** (`NetInfo.addEventListener` → `setOffline(!isConnected)`).
- **Storage contract (plan 02 resolution):** `user-storage` is generic over a `StoredUser` shape it
  defines **itself** and exposes **async** functions. The mapping `User` ↔ `StoredUser` is the
  **responsibility of this auth store** (plan 07), keeping storage free of any cross-parallel
  dependency on the `User` model (plan 04).
- Design alignment (`web-page-stores-structure`): these are cross-page global stores living under
  `src/layout/stores/` (not a per-page `stores/` folder). One store per concern, single file each —
  **do not over-split** a small store into a folder.
- Conventions (`code-write-code` / frontend preferences): kebab-case file names, no comments,
  self-explanatory code, keep existing patterns, type FK/ids as-is from the model.
- **No formatting/lint step** for this plan. Verification is `npx tsc --noEmit` only.

## Owned files (the only files this plan creates/touches)

```
project-mobile/src/layout/stores/auth-store.ts
project-mobile/src/layout/stores/connectivity-store.ts
project-mobile/src/layout/stores/menu-store.ts
project-mobile/src/layout/hooks/use-connectivity.ts
```

## Assumed external symbols (owned by other plans — referenced, not created here)

From plan 02 (`src/storage/`):

```ts
// src/storage/user-storage.ts
export interface StoredUser { /* same fields as User; defined by plan 02 */ }
export function getStoredUser(): Promise<StoredUser | null>;
export function setStoredUser(user: StoredUser): Promise<void>;
export function clearStoredUser(): Promise<void>;

// src/storage/token-storage.ts
export function clearStoredToken(): Promise<void>;
```

From plan 04 (`src/api/models/user.ts`):

```ts
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  providerId: string;
}
```

> Note: `StoredUser` (plan 02) and `User` (plan 04) are **structurally identical** today. The auth
> store still maps explicitly between them so that a future divergence in either shape surfaces as a
> compile error here, where the mapping lives — rather than silently passing a `User` where a
> `StoredUser` is expected.

Library (declared in `MOBILE-PORT-ANALYSIS.md`, installed by an earlier scaffold/plan): the dep
`@react-native-community/netinfo` must be present in `project-mobile/package.json`. If it is not yet
installed when this plan runs, add it (`npx expo install @react-native-community/netinfo`) before
`tsc` — it is the only new runtime dependency this plan introduces.

---

## Step 1 — `auth-store.ts` (rewrite persistence: cookies → native async storage)

**Web reference** (`project-web/src/layout/stores/auth-store.ts`): reads the user synchronously from
a cookie at store creation, writes the cookie on `setUser`, removes it on `clear`.

**Mobile changes:**

1. Drop `js-cookie` and the `USER_COOKIE` constant + `readStoredUser()` helper (the
   `@ben/user` key now lives inside `user-storage`, plan 02).
2. `user` initializes to `null` (synchronous), because device storage is async — state hydrates
   later (see "Hydration" note below).
3. `setUser(user)` maps `User → StoredUser`, fires `setStoredUser(...)` (async, fire-and-forget),
   and `set({ user })` immediately so the UI updates without awaiting the write.
4. `clear()` clears in-memory user **and** removes both stored user and stored token
   (`clearStoredUser()` + `clearStoredToken()`), matching the briefing's session-teardown
   requirement. Both async, fire-and-forget; `set({ user: null })` is synchronous so the UI logs out
   instantly.
5. Add a `hydrate()` action that loads the persisted user once on boot and maps `StoredUser → User`.

```ts
import { create } from "zustand";
import type { User } from "@/api/models/user";
import type { StoredUser } from "@/storage/user-storage";
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from "@/storage/user-storage";
import { clearStoredToken } from "@/storage/token-storage";

function toStoredUser(user: User): StoredUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    providerId: user.providerId,
  };
}

function toUser(stored: StoredUser): User {
  return {
    id: stored.id,
    name: stored.name,
    username: stored.username,
    email: stored.email,
    avatarUrl: stored.avatarUrl,
    providerId: stored.providerId,
  };
}

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
  clear: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => {
    void setStoredUser(toStoredUser(user));
    set({ user });
  },
  clear: () => {
    void clearStoredUser();
    void clearStoredToken();
    set({ user: null });
  },
  hydrate: async () => {
    const stored = await getStoredUser();
    set({ user: stored ? toUser(stored) : null });
  },
}));
```

**Hydration note (out of scope to wire here, but required to document):** the briefing says
"initial state may begin empty and hydrate once persistence resolves." This store therefore exposes
`hydrate()`; the actual boot wiring (calling `useAuthStore.getState().hydrate()` together with
`loadTokenIntoMemory()` from plan 02) belongs to the **scaffold/app-boot plan (01)** or the
**auth-flow plan (09)** — **not this plan**. We only provide the action so those plans can call it.
This keeps plan 07 parallel-safe (no edits outside the four owned files).

> Decision (kept minimal, no guessing): if reviewers prefer the auth store to hydrate itself on
> creation via a fire-and-forget IIFE, that is a one-line change. Default chosen here is an explicit
> `hydrate()` action because (a) it is testable, (b) it avoids a side effect at module-eval time,
> and (c) it mirrors plan 02's `loadTokenIntoMemory()` boot pattern (both are explicitly called on
> boot). No app-boot file is edited by this plan regardless.

---

## Step 2 — `connectivity-store.ts` (copy intact)

Platform-agnostic; copied verbatim from web. Same shape (`isOffline` flag + `setOffline`).
The data **source** changes (the hook in Step 4), not the store.

```ts
import { create } from "zustand";

interface ConnectivityStore {
  isOffline: boolean;
  setOffline: (value: boolean) => void;
}

export const useConnectivityStore = create<ConnectivityStore>((set) => ({
  isOffline: false,
  setOffline: (value) => set({ isOffline: value }),
}));
```

---

## Step 3 — `menu-store.ts` (copy intact)

Pure state machine (view / detailTarget / isSettingsOpen + transitions). No platform APIs →
copied verbatim from web, including every transition (`selectEntry`, `goBackToMenu`, `openDetail`,
`closeDetail`, `closeSettings`, `reset`) and the `INITIAL_STATE` object used by `reset()`.

```ts
import { create } from "zustand";

export type MenuView = "menu" | "tasks" | "notes" | "reminders";

export type MenuEntryId = "tasks" | "notes" | "reminders" | "settings";

export type MenuDetailTarget =
  | { kind: "note"; id: string }
  | { kind: "reminder"; id: string }
  | null;

interface MenuStore {
  view: MenuView;
  detailTarget: MenuDetailTarget;
  isSettingsOpen: boolean;
  selectEntry: (id: MenuEntryId) => void;
  goBackToMenu: () => void;
  openDetail: (target: NonNullable<MenuDetailTarget>) => void;
  closeDetail: () => void;
  closeSettings: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  view: "menu" as MenuView,
  detailTarget: null as MenuDetailTarget,
  isSettingsOpen: false,
};

export const useMenuStore = create<MenuStore>((set) => ({
  ...INITIAL_STATE,
  selectEntry: (id) => {
    if (id === "settings") {
      set({ isSettingsOpen: true });
      return;
    }
    set({ view: id });
  },
  goBackToMenu: () => set({ view: "menu" }),
  openDetail: (target) => set({ detailTarget: target }),
  closeDetail: () => set({ detailTarget: null }),
  closeSettings: () => set({ isSettingsOpen: false }),
  reset: () => set(INITIAL_STATE),
}));
```

---

## Step 4 — `use-connectivity.ts` (rewrite over NetInfo)

**Web reference**: local `useState(!navigator.onLine)`, subscribes to `window` `online`/`offline`
events, and mirrors the local flag into the store via a second `useEffect`.

**Mobile changes:** replace the browser signal/events with NetInfo. Subscribe on mount, unsubscribe
on unmount, translate connectivity to the offline flag, push into the store, and return the current
status to callers (same `{ isOffline }` return contract as web).

```ts
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";

export function useConnectivity() {
  const [isOffline, setIsOffline] = useState(false);
  const setOffline = useConnectivityStore((store) => store.setOffline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setOffline(isOffline);
  }, [isOffline, setOffline]);

  return {
    isOffline,
  };
}
```

**Notes:**

- `NetInfo.addEventListener` **fires immediately** with the current state on subscription, so the
  initial `useState(false)` is corrected on the first callback — there is no synchronous
  equivalent to `navigator.onLine` to seed it, and seeding to `false` (online-optimistic) matches
  the store default. No extra `NetInfo.fetch()` call is needed.
- `state.isConnected` is `boolean | null`; `!state.isConnected` collapses both `false` and `null`
  (unknown) to "offline", which is the safe interpretation and keeps the `setIsOffline` argument a
  strict `boolean`.
- The two-`useEffect` structure (local state → store mirror) is preserved from web so the hook's
  shape and call sites stay identical.

---

## Cross-cutting conventions applied

- **kebab-case** file names (all four already are).
- **No comments** in the emitted code; names are self-explanatory.
- **One store per concern**, single file each — no folder split (`web-page-stores-structure`
  "do not over-split a small store").
- Imports use the `@/` path alias (resolved by the scaffold's tsconfig paths +
  `babel-plugin-module-resolver`, per `MOBILE-PORT-ANALYSIS.md`).
- Type-only imports (`import type { User }`, `import type { StoredUser }`) so this plan creates no
  runtime ownership conflict with plans 02/04.

## Parallel-safety checklist

- Touches only the 4 owned files. ✅
- No edits to app-boot, router, or any plan 02/04/06 file. ✅
- `hydrate()` is **exposed** but **not wired** here (wiring belongs to plan 01/09). ✅

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with no errors. (No `npm run lint:fix` / formatting step for this plan.)

### Expected `tsc` dependencies that must resolve

- `@/storage/user-storage` exporting `StoredUser`, `getStoredUser`, `setStoredUser`,
  `clearStoredUser` (plan 02).
- `@/storage/token-storage` exporting `clearStoredToken` (plan 02).
- `@/api/models/user` exporting `User` (plan 04).
- `@react-native-community/netinfo` types available (its `NetInfoState.isConnected: boolean | null`).
- `@/layout/stores/connectivity-store` (created in Step 2 of this same plan).

If any of plan 02 / plan 04's symbol names differ at integration time, adjust the imports in
`auth-store.ts` only — the other three files have no cross-plan imports beyond the in-plan
`connectivity-store`.
