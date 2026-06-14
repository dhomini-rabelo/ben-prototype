# Diff Review — `project-mobile`

Review of the newly created `project-mobile/` (React Native + Expo port of `project-web`, ~177 untracked TS/TSX files under `app/` and `src/`) against the project's coding designs and recorded repository conventions. This is a **review-only** document — no code was modified.

## Scope reviewed

- The four coding designs: `page-structure`, `web-api-client-structure`, `web-page-stores-structure`, `web-feature-state-components-structure`.
- Recorded conventions: one component per file; no pure barrel/re-export files; consistency with how `project-web` names and structures pages, stores, hooks, requests.
- Port fidelity: NativeWind class usage, icon `color`/`size` props, `ROUTES`-based navigation, `expo-notifications` confined to `src/services/`, RN-safe ids via `expo-crypto`, and absence of web-only APIs.

## Web-only API grep sweep (required)

Command (run from repo root):

```
grep -rnE "window\.|document\.|IntersectionObserver|MediaRecorder|js-cookie|react-router|import\.meta" project-mobile/src project-mobile/app
```

**Result: no matches.** No leftover web-only DOM/browser APIs. Follow-up sweeps for `Cookies` / `js-cookie` / `localStorage` / `sessionStorage` and for web-only Tailwind variants (`hover:`, `cursor-*`, `sm:`/`md:`/`lg:`, `group-hover:`) also returned **no real matches** (the only `active:` hits are valid NativeWind pressable variants, and `cursor-paginated` is a substring of a hook filename).

## What follows the standard (high confidence)

- **API client layer** mirrors `web-api-client-structure` exactly: identical `src/api/{client.ts,routes.ts,types.ts,models/,responses/,requests/}` file set as `project-web`. Request functions return unwrapped payloads; the auth interceptor injects the token and clears it on `401` — adapted correctly from cookies to `SecureStore` + an in-memory cache (`getCachedToken()`), with a `setUnauthorizedHandler` indirection so the client does not import the router.
- **Page structure** matches `page-structure`: `chat/`, `task-workspace/`, `login/`, `menu/` each own `page.tsx`, `components/`, `hooks/`, `states/`, `stores/`, `utils/`; all file/folder names are kebab-case and exported component identifiers stay PascalCase.
- **Page stores** follow `web-page-stores-structure`: `task-workspace/stores/` has a `task-store.ts` root coordinating `reset()` across per-concern stores (chat/content/diff/lifecycle/todos), and `chat/stores/messages-store/` is the folder-split-store pattern (`index.ts` + `types.ts` + `dispatch-reply.ts` + `message-builders.ts` + `animate-reply.ts`).
- **Feature state components** follow `web-feature-state-components-structure`: `menu-list`, `menu-notes`, `menu-reminders`, `menu-tasks`, `menu-detail` keep the container/`-view` + `-list`/`-content` + `-loading`/`-error`/`-empty`/`-gone` split, consuming zustand stores directly.
- **One component per file** — confirmed: no `.tsx` file declares two exported React components.
- **No pure barrels** — every `index.ts(x)` is a compound-component value object (`chat-input`, `chat-banner`, `capture-card`), a store creator (`messages-store/index.ts`, `voice-store/index.ts`), or a `types/index.ts` type module. None re-export only. These mirror `project-web` and are explicitly allowed.
- **Notifications boundary** — `expo-notifications` is imported only in `src/services/notifications-service.ts`. No leakage into pages/components/hooks.
- **RN-safe ids** — `expo-crypto`'s `randomUUID()` is used in `task-todos-store.ts` and `messages-store/message-builders.ts`; no `crypto.randomUUID`/`uuid`.
- **Navigation via ROUTES** — every `router.push`/`router.replace` and `<Redirect href>` references `ROUTES` from `src/core/routes.ts`; no raw path literals. The parameterized `ROUTES.taskWorkspace(taskId)` is used consistently.
- **Mobile-only additions are idiomatic** — `src/storage/{token-storage,user-storage}.ts` (SecureStore + AsyncStorage), `src/core/{env,query-client,auth-bootstrap}.ts`, and the RN-specific UI pieces (`pulse-view`, `bouncing-dots`, `wave-bar`, `recording-bar`, `chat-history`, `use-chat-list`) are well-structured and placed correctly (page-scoped vs layout-scoped).

## Findings

### Finding 1 — Theme colors duplicated as local hex constants across many icon files

- **Files:** local `const ON_SURFACE_VARIANT = '#444748'` / `ON_PRIMARY = '#ffffff'` / `ON_SURFACE = '#1a1c1c'` declarations in **~14 files**, including `src/pages/chat/components/capture-card/capture-card-action-button.tsx`, `.../capture-card-icon.tsx`, `src/pages/task-workspace/components/diff-bar/diff-bar.tsx`, `.../todo-content/todo-list-item.tsx`, `.../todo-content/add-todo-row.tsx`, `.../workspace-top-bar/workspace-top-bar.tsx`, `src/layout/components/menu-list/menu-list-row.tsx`, `.../menu-list/menu-list-shell.tsx`, `.../menu/menu-sidebar.tsx`, `.../chat-banner/chat-banner-icon.tsx`, `.../chat-banner/chat-banner-dismiss.tsx`, `.../chat-input/chat-input-action-button.tsx`, `.../chat-input/chat-input-attach-button.tsx`, `src/pages/chat/components/message-footers/transcribing-footer.tsx`; **plus raw inline hex** (`color="#444748"`, `color="#121213"`, `color="#ffffff"`, `color="#c53030"`) in `src/pages/login/page.tsx`, `src/pages/chat/components/chat-top-bar/chat-top-bar.tsx`, `src/pages/chat/components/suggested-action.tsx`, `src/pages/chat/components/task-picker/task-picker-list.tsx`, `src/layout/components/recording-bar.tsx`, `src/layout/components/brand-mark.tsx`, `src/layout/components/menu-detail/{item-detail-root,item-detail-error}.tsx`, `src/layout/components/menu-settings/settings-sheet.tsx`.
- **Standard violated:** consistency / single source of truth. `tailwind.config.js` already defines these exact values as theme tokens (`on-surface-variant: #444748`, `on-surface: #1a1c1c`, `primary: #121213`). The same color is being re-declared 14+ times and inlined as raw hex elsewhere — three different spellings of the same intent.
- **Why explicit `color` is correct (not a bug):** `lucide-react-native` SVG icons do not pick up NativeWind `text-*` classes the way web SVG inherits `currentColor`, so passing an explicit `color` prop is the right RN approach. The issue is purely the *duplication / lack of a shared source*, not the use of `color`.
- **Severity:** medium. **Confidence:** high.
- **Recommended improvement:** add one small shared module (e.g. `src/layout/utils/colors.ts` or `src/core/colors.ts`) exporting the theme color tokens (`ON_SURFACE_VARIANT`, `ON_PRIMARY`, `ON_SURFACE`, the error red `#c53030`, `#121213`), keyed to the same values as `tailwind.config.js`, and import from it everywhere instead of re-declaring/inlining. Keeps icon colors in lockstep with the NativeWind theme.

### Finding 2 — Dead, mis-named cookie constants in the mobile API client

- **File:** `src/api/client.ts` lines 14–15: `export const JWT_COOKIE = '@ben/jwttoken'` and `export const PROVIDER_COOKIE = '@ben/authprovidertoken'`.
- **Standard violated:** port fidelity / no dead code. These are leftovers from `project-web`, where `Cookies.get(JWT_COOKIE)` consumed them. In mobile, tokens live in `src/storage/token-storage.ts` (`JWT_TOKEN_KEY` / `PROVIDER_TOKEN_KEY` + the `SECURE_KEYS` map). A repo-wide grep shows `JWT_COOKIE` / `PROVIDER_COOKIE` are **never read** — they are exported but unused, and the `COOKIE` name is now a misnomer (no cookies on RN).
- **Severity:** low. **Confidence:** high.
- **Recommended improvement:** delete both constants from `client.ts`. The canonical key names already live in `token-storage.ts`; if a shared name is ever needed, import from there rather than re-defining under a cookie name.

### Finding 3 — Auth-bootstrap hook file not named with the `use-` prefix

- **File:** `src/core/auth-bootstrap.ts` exporting the hook `useAuthBootstrap` (consumed by `app/(protected)/_layout.tsx`).
- **Standard touched:** `page-structure` hook-naming convention — "Hook files are kebab-case (e.g. `use-chat.ts`)", i.e. the filename mirrors the exported hook name. Every other hook in the codebase follows this (`use-chat-list.ts`, `use-workspace-task.ts`, `use-google-auth.ts`, the `layout/hooks/api/use-*-data.ts` set). `auth-bootstrap.ts` is the lone hook whose filename omits the `use-` prefix.
- **Mitigating context:** it lives in `src/core/` (cross-cutting app wiring), not a page `hooks/` folder, so the convention is slightly looser here; `project-web` has no direct counterpart (web uses `core/auth.tsx`). This is a cosmetic naming nit, not a structural break.
- **Severity:** low. **Confidence:** medium (speculative — the `core/` location makes the rule less strictly applicable).
- **Recommended improvement:** rename to `src/core/use-auth-bootstrap.ts` to match the hook-file naming convention, updating the single import in `app/(protected)/_layout.tsx`. Optional / stylistic.

## Prioritized list

**High-confidence (worth applying):**

1. **Finding 1 (medium)** — Centralize the duplicated icon color tokens into one shared module aligned with `tailwind.config.js`. ~14 files re-declare or inline the same hex.
2. **Finding 2 (low)** — Remove the dead, mis-named `JWT_COOKIE` / `PROVIDER_COOKIE` exports from `src/api/client.ts`.

**Speculative / optional:**

3. **Finding 3 (low)** — Rename `src/core/auth-bootstrap.ts` → `use-auth-bootstrap.ts` to match the `use-`-prefixed hook-file convention. Cosmetic; the `core/` location softens the rule.

**No issues found** for: web-only API leftovers (clean grep), barrel/re-export files, one-component-per-file, `expo-notifications` boundary, `expo-crypto` ids, `ROUTES` navigation, NativeWind variant usage, and overall API/page/store/feature-state structural fidelity to `project-web`.
