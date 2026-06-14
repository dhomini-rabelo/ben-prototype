# Implementation Plan 28 — Menu integration (native modal route + triggers + navigation)

> **Status: PLAN ONLY — do not implement yet.** Deep, code-level implementation plan for the
> `project-mobile` menu integration.
> **Runs alone, last.** It is **SYNC** (not parallel-safe): it adds the menu modal route, edits the
> chat shell trigger (owned by plan 14, mounted by plan 16), edits the protected navigator layout
> (owned by plan 09), and edits the menu feature/detail/settings pieces (owned by plans 21/25/26) to
> drive real navigation. Because every menu component plan and both page-assembly plans (16/27) have
> already landed when this runs, this plan reconciles against the **on-disk** files, not the briefs.
> **Depends on:** plan 09 (`(protected)` group + guard + `ROUTES`/`auth-store`), plan 14
> (`ChatTopBar` `onOpenMenu`/`onMenu`), plan 16 (chat page mounts the menu seam), plan 20/27 (task
> route `app/(protected)/tasks/[taskId].tsx`), plan 21 (menu shell: `MenuOverlay`, `MenuSidebarView`,
> `MenuListRow`), plan 25 (feature list views), plan 26 (detail + settings).
> **Verification:** `cd project-mobile && npx tsc --noEmit` (no formatting / lint step).
> **Auto-approval:** execute every step without asking the user.

---

## 1. Context & references read

- **Brief:** `28-menu-integration/start-briefing.md` + `28-menu-integration/briefing/01-menu-integration.md`.
- **Decisions:** `MOBILE-PORT-ANALYSIS.md` point **5** (line 69): the web menu overlay (today
  state-driven over the chat page) and the note/reminder **detail modals** *can become native
  Expo Router modals*, which improves mobile UX. This plan realizes that: the menu becomes a
  `presentation: "modal"` route instead of an in-page overlay.
- **Web reference (the behavior being ported):**
  - `project-web/src/pages/chat/page.tsx:25,57,85` — `const [isMenuOpen, setIsMenuOpen] = useState(false)`,
    `<ChatTopBar onMenu={() => setIsMenuOpen(true)} />`, `{isMenuOpen && <MenuOverlay onClose={...} />}`.
    The web menu is a sibling overlay layered over the chat page, driven by local page state.
  - `project-web/src/layout/components/menu/menu-overlay.tsx` — renders the active view
    (`menu | tasks | notes | reminders`) plus a bottom **detail** surface (note/reminder) and a bottom
    **settings** surface, all from `useMenuStore`; `useEffect(() => () => reset(), [reset])` resets the
    transient menu state on unmount; backdrop `onClick` → `onClose` / `closeDetail` / `closeSettings`.
  - `project-web/src/layout/stores/menu-store.ts` — `view`, `detailTarget`, `isSettingsOpen`,
    `selectEntry(id)` (settings → `isSettingsOpen=true`, else `view=id`), `goBackToMenu`,
    `openDetail`, `closeDetail`, `closeSettings`, `reset`. **Platform-agnostic; reused as-is** (plan 07
    ports it byte-for-byte — `MOBILE-PORT-ANALYSIS.md:21,56`).
  - `project-web/src/layout/components/menu/menu-sidebar-view.tsx` — wraps `MenuSidebar` with
    `onSelect={selectEntry}` and the captures-count data hook.
  - `project-web/src/layout/components/menu-tasks/menu-tasks-list.tsx` — **task rows have NO `onClick`
    today** (web does not navigate from the menu task list). The brief asks mobile to *add* task-row
    navigation to the task workspace. Notes/reminders rows already call `onSelect` →
    `openDetail({ kind, id })` (`menu-notes-view.tsx:32`, `menu-reminders-view.tsx:40`).
  - `project-web/src/layout/components/menu-settings/settings-view.tsx` — `handleSignOut`:
    `Cookies.remove ×2` + `clear()` + `navigate(ROUTES.login)`. On mobile, cookie removal is gone
    (plan 26 already drops it) and the **post-logout navigation is owned by THIS plan** (plan 26 brief
    step 4: "defer any post-logout navigation to the platform routing owned by plan 28").
  - `project-web/src/core/router.tsx` — `login` public; `chat` + `taskWorkspace` inside `<Auth/>`.
    Mobile equivalent: both live under `app/(protected)/` (plan 09 §8, plan 16 §4).
- **Coordinated plan files (already on disk when this runs):**
  - Plan 16 `src/pages/chat/page.tsx` — keeps `isMenuOpen` state + `onMenu`→`setIsMenuOpen(true)` and
    mounts `{isMenuOpen && <MenuOverlay onClose={...} />}` behind an explicit **MENU SEAM (plan 28)**
    comment (plan 16 §3 lines 148-149, 179, 206-209). Plan 14 exposes the trigger as `onOpenMenu`
    (plan 14 Step 3) — plan 16 wired it as `onMenu`; **reconcile against the real prop name on disk**.
  - Plan 09 `app/(protected)/_layout.tsx` — `return <Stack screenOptions={{ headerShown: false }} />`
    after the guard. Adding the modal route's presentation options is a coordinated edit here (plan 09
    §8 anticipates child route files landing later).
  - Plan 01 `src/core/routes.ts` — `{ login: '/', chat: '/chat', taskWorkspace: (taskId = '[taskId]') => '/tasks/${taskId}' }`.
- **Design (`code-get-coding-designs` / `code-write-code`):** page-structure (screen in `src/pages/`,
  thin `app/` route adapter), kebab-case filenames, PascalCase identifiers, named exports (expo-router
  route files are the only `default` exports), no comments except load-bearing seam markers, no
  barrel/index files (user memory: *no export-only files*), one component per file (user memory),
  path-alias `@/…` imports, **routes declared via the `routes.ts` pattern — no ad-hoc path builders**
  (frontend prefs), `*-root` over `*-shell` for wrappers (frontend prefs — does not apply to new
  files here, noted for any reconciliation).

### Cross-plan symbols consumed (already exist when this plan runs — do NOT recreate)

| Import | From | Plan | Used for |
|---|---|---|---|
| `useMenuStore` (`view`, `selectEntry`, `goBackToMenu`, `openDetail`, `detailTarget`, `closeDetail`, `isSettingsOpen`, `closeSettings`, `reset`) | `@/layout/stores/menu-store` | 07 | menu view/detail/settings state |
| `MenuSidebarView` | `@/layout/components/menu/menu-sidebar-view` | 21 | main menu surface |
| `MenuSheet` / sheet wrapper | `@/layout/components/menu/menu-sheet` | 21 | bottom-anchored detail/settings container |
| `MenuListRow` (+ `onPress`) | `@/layout/components/menu-list/menu-list-row` | 21 | list rows (task-row `onPress` added here via plan 25 views) |
| `MenuTasksView` / `MenuNotesView` / `MenuRemindersView` | `@/layout/components/menu-{tasks,notes,reminders}/menu-{…}-view` | 25 | feature list views |
| `NoteDetail` / `ReminderDetail` | `@/layout/components/menu-detail/{note,reminder}-detail` | 26 | detail bodies (props `{ id, onClose }`) |
| `SettingsView` | `@/layout/components/menu-settings/settings-view` | 26 | settings sheet body |
| `ROUTES.taskWorkspace`, `ROUTES.login`, `ROUTES.menu` (added here) | `@/core/routes` | 01 | navigation targets |
| `ChatTopBar` (`onOpenMenu`/`onMenu`) | `@/pages/chat/components/chat-top-bar/chat-top-bar` | 14 | menu trigger |
| `useAuthStore` (`clear`) | `@/layout/stores/auth-store` | 07 | logout teardown (already called in plan-26 `SettingsView`) |
| `router`, `Stack`, `useRouter` | `expo-router` | 01 dep | navigation + modal presentation |

> **Reconciliation rule (NO GUESSING).** Before wiring each import, confirm the export name/path
> against the file the owning plan actually produced. The menu component plans (21/25/26) currently
> have **briefings only** (no deep plan), so their final file names/exports may differ slightly
> (`menu-sheet` vs a `MenuSheet`-named file, `goBackToMenu` casing, `NoteDetail` prop `noteId` vs
> `id`). Adapt this plan's import specifiers and prop names to the on-disk reality; do **not** invent a
> symbol or restructure an owned file beyond the coordinated edits listed in §2.

---

## 2. Owned / edited files (the only files this plan creates or touches)

```
project-mobile/
├── app/(protected)/
│   ├── menu.tsx                      (NEW — menu modal route; presentation: "modal")
│   └── _layout.tsx                   (EDIT, plan 09 — register menu Screen as a modal)
├── src/
│   ├── core/
│   │   └── routes.ts                 (EDIT, plan 01 — add `menu: '/menu'`)
│   ├── pages/
│   │   └── menu/
│   │       └── page.tsx              (NEW — Menu screen: renders the active surface from menu-store)
│   ├── pages/chat/
│   │   └── page.tsx                  (EDIT, plan 16 — onMenu → router.push(ROUTES.menu); drop overlay seam)
│   └── layout/components/
│       ├── menu-tasks/menu-tasks-view.tsx   (EDIT, plan 25 — task row onPress → task workspace)
│       └── menu-settings/settings-view.tsx  (EDIT, plan 26 — post-logout router.replace(login))
```

No barrel/index files. One component per file. All new filenames kebab-case; new identifiers
PascalCase; `app/` route files use the framework-required default export.

> **Why a `src/pages/menu/page.tsx` screen + a thin `app/(protected)/menu.tsx` route** (not the screen
> body inline in the route file): this is the established page-structure split every other screen uses
> (chat: plan 16 §3/§4; login: plan 09 §6/§7) — the `app/` file is a pure expo-router adapter that
> sets `Stack.Screen` options and renders the `src/pages/menu/page.tsx` component. It keeps the screen
> testable/importable and the route file declarative.

---

## 3. `src/core/routes.ts` — add the menu route (EDIT, plan 01)

The menu becomes a first-class route, so it must be declared in the `routes.ts` map (frontend prefs:
*declare routes via the `routes.ts` pattern; no ad-hoc path builders*). One added line:

```ts
export const ROUTES = {
  login: '/',
  chat: '/chat',
  menu: '/menu',
  taskWorkspace: (taskId = '[taskId]') => `/tasks/${taskId}`,
} as const
```

Notes:
- `'/menu'` resolves to `app/(protected)/menu.tsx` because the `(protected)` group is path-transparent
  in expo-router (same rule plan 16 §4 relies on for `/chat`). The menu is therefore auth-gated by the
  plan-09 guard for free — consistent with web, where the menu only renders inside the authed chat.
- Keep the file's existing quote/semicolon style as it is on disk (plan 01 §2.14 sets the mobile
  config to no-semi/single-quote; match whatever the real file uses — reconciliation rule).

---

## 4. `app/(protected)/menu.tsx` — menu modal route (NEW)

Thin expo-router adapter: render the `Menu` screen and let the **parent `Stack` (`_layout.tsx`)**
declare `presentation: "modal"` (§5). Keeping the presentation on the parent `Stack.Screen` (rather
than a per-file `<Stack.Screen options={{ presentation: 'modal' }} />`) is the idiomatic expo-router
way to make a route open as a native modal — the screen's *entry* into the stack is what gets the
modal animation, and that is declared where the navigator is defined. We still set `headerShown:
false` per-file for parity with the headerless web surface (the menu draws its own brand mark / list
shells).

```tsx
import { Stack } from 'expo-router'
import { Menu } from '@/pages/menu/page'

export default function MenuScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Menu />
    </>
  )
}
```

Notes:
- Default export named `MenuScreen` (expo-router route contract); `Menu` stays the named feature
  component in `src/pages/menu/page.tsx` — mirrors the chat `ChatScreen`/`Chat` split (plan 16 §4).
- The `<Stack.Screen options={{ headerShown: false }} />` form (no name prop) configures *this*
  screen; `presentation: 'modal'` is set once on the navigator in `_layout.tsx` §5 so the route
  presents as a sheet/card slide-up. Setting both is harmless; if reconciliation shows the project
  prefers per-file presentation, move `presentation: 'modal'` here instead and drop it from §5 — pick
  exactly one place, do not duplicate it.

---

## 5. `app/(protected)/_layout.tsx` — register the menu Screen as a modal (EDIT, plan 09)

Plan 09 ships the guard returning a bare `<Stack screenOptions={{ headerShown: false }} />` with no
declared children (children resolve from the `app/(protected)/` files). To give the `menu` route the
native modal presentation, declare it explicitly as a `Stack.Screen` with `presentation: "modal"`.
The other routes (`chat`, `tasks/[taskId]`) keep their default card presentation and need no explicit
`Screen` entry (expo-router auto-registers file routes), so only the modal route is named.

Edit (guard logic from plan 09 §8 unchanged; only the returned `<Stack>` body changes):

```tsx
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="menu" options={{ presentation: 'modal' }} />
    </Stack>
  )
```

Notes:
- `name="menu"` matches the route file `app/(protected)/menu.tsx` (file name = route segment within
  the group). `presentation: 'modal'` makes it slide up as the platform native modal sheet
  (`MOBILE-PORT-ANALYSIS.md:69`), replacing the web's `fixed inset-0 … backdrop-blur` overlay.
- Declaring one child `Stack.Screen` does **not** require declaring the others — expo-router still
  auto-discovers `chat.tsx` and `tasks/[taskId].tsx`. This is the minimal coordinated edit to plan
  09's file: insert a single child `Screen`, leave the guard/redirect/`isReady` logic intact.
- **Native dismiss → menu reset.** The web reset-on-close (`MenuOverlay`'s
  `useEffect(() => () => reset(), [reset])`) is preserved by the `Menu` screen's own unmount effect
  (§6), which fires whenever the modal is dismissed by swipe-down, hardware back, or `router.back()`.
  No layout-level listener is needed — the screen owning the reset matches the web ownership (the
  overlay owned the reset) and is the platform-correct place (the screen unmounts on every dismissal).
- If plan 09's on-disk `_layout.tsx` uses a different group name (`(app)`/`(auth)` — plan 09 §8 flag),
  apply this edit to whatever protected group exists and place `menu.tsx` in the same group so the
  path stays `/menu` (reconciliation rule). Do not create a second group.

---

## 6. `src/pages/menu/page.tsx` — Menu screen (NEW)

This is the native-modal replacement for the web `MenuOverlay`. It renders **whichever surface the
menu store asks for** — the same four views plus the bottom detail and settings sheets — and resets
the transient menu state on unmount (dismiss), exactly matching `menu-overlay.tsx`. The structural
differences vs web are platform ones:

- The web `fixed`/`z-*`/backdrop-blur overlay scaffolding is gone — the route itself *is* the modal
  surface (plan 09 §5 `presentation: "modal"`). No manual backdrop.
- The web backdrop `onClick` → `onClose` (close the whole menu) becomes the **native modal dismiss**
  (swipe-down / back), so the page does not render its own full-menu close affordance; the
  `MenuSidebarView`/list shells already expose their own back-to-menu controls (plan 21/25).
- The detail and settings **sub-sheets** were nested overlays on web (`z-[60]`/`z-[70]`); on mobile
  they render as bottom-anchored `MenuSheet` surfaces stacked over the active view within this same
  modal (plan 21 owns `MenuSheet` styling: rounded top, grab handle, elevation). `closeDetail` /
  `closeSettings` dismiss only the sub-sheet (back to the list), matching web's separate close paths.
  Wrapping them in safe-area insets is plan 21's concern (menu-shell brief step 7); this screen just
  mounts them.

```tsx
import { View } from 'react-native'
import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { MenuSidebarView } from '@/layout/components/menu/menu-sidebar-view'
import { MenuTasksView } from '@/layout/components/menu-tasks/menu-tasks-view'
import { MenuNotesView } from '@/layout/components/menu-notes/menu-notes-view'
import { MenuRemindersView } from '@/layout/components/menu-reminders/menu-reminders-view'
import { NoteDetail } from '@/layout/components/menu-detail/note-detail'
import { ReminderDetail } from '@/layout/components/menu-detail/reminder-detail'
import { SettingsView } from '@/layout/components/menu-settings/settings-view'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { useMenuStore } from '@/layout/stores/menu-store'

export function Menu() {
  const router = useRouter()
  const view = useMenuStore((store) => store.view)
  const detailTarget = useMenuStore((store) => store.detailTarget)
  const isSettingsOpen = useMenuStore((store) => store.isSettingsOpen)
  const closeDetail = useMenuStore((store) => store.closeDetail)
  const closeSettings = useMenuStore((store) => store.closeSettings)
  const reset = useMenuStore((store) => store.reset)

  useEffect(() => () => reset(), [reset])

  return (
    <View className="flex-1 bg-surface-container-lowest">
      {view === 'menu' && <MenuSidebarView />}
      {view === 'tasks' && <MenuTasksView onSelectTask={(id) => router.back()} />}
      {view === 'notes' && <MenuNotesView />}
      {view === 'reminders' && <MenuRemindersView />}

      {detailTarget && (
        <View className="absolute inset-x-0 bottom-0">
          <MenuSheet>
            {detailTarget.kind === 'note' ? (
              <NoteDetail noteId={detailTarget.id} onClose={closeDetail} />
            ) : (
              <ReminderDetail reminderId={detailTarget.id} onClose={closeDetail} />
            )}
          </MenuSheet>
        </View>
      )}

      {isSettingsOpen && (
        <View className="absolute inset-x-0 bottom-0">
          <MenuSheet>
            <SettingsView onClose={closeSettings} />
          </MenuSheet>
        </View>
      )}
    </View>
  )
}
```

Notes / rationale (mapped to `menu-overlay.tsx` + brief):
- **Surface switch** (`view === …`) and the **detail/settings precedence** are copied 1:1 from
  `menu-overlay.tsx:35-71`. `detailTarget` is read as the whole object here (web split it into
  `kind`/`id` selectors to minimize re-renders; the object selector is equivalent and simpler — and a
  zustand object selector re-renders only on identity change, which `openDetail`/`closeDetail` already
  produce). Reconcile against the store's actual `detailTarget` shape (`{ kind, id } | null`).
- **`useEffect(() => () => reset(), [reset])`** — identical to web; this is the *reset-on-dismiss*
  guarantee (brief step 1, simple-plan point 1). Because the whole `Menu` screen unmounts when the
  native modal is dismissed (swipe/back/`router.back()`), `reset()` runs on every close path — the
  mobile analog of the web overlay unmount. No extra navigation listener needed.
- **`MenuSheet`** wraps detail/settings (web wrapped them in a `fixed bottom-0 … flex-col` container +
  the `MenuSheet` grab-handle sheet). On mobile, the `absolute inset-x-0 bottom-0` view anchors the
  sheet to the bottom within the modal; `MenuSheet` (plan 21) supplies the rounded top / handle /
  elevation. If plan 21's `MenuSheet` already self-anchors (its own absolute positioning), drop the
  wrapping `View` and mount `MenuSheet` directly — reconcile against the on-disk `menu-sheet`.
- **`NoteDetail`/`ReminderDetail` props** — web uses `noteId`/`reminderId` + `onClose` (see
  `note-detail.tsx:10-13`). Plan 26 should keep those names (it ports the bodies 1:1). If plan 26
  renamed to a generic `id`, adapt the prop here (reconciliation rule).
- **`SettingsView` `onClose`** — see §8: this plan adds an `onClose` prop to `SettingsView` so the
  settings sheet's own dismissal (and post-logout) is driven from here; `closeSettings` returns to the
  menu without losing position (brief step 4). If plan 26 shipped `SettingsView` with no `onClose`
  (closing handled purely by the store), drop the prop and rely on `closeSettings` being called inside
  the sheet — reconcile against plan 26's actual `SettingsView` signature.
- **No backdrop element** — the modal presentation provides the dim/backdrop natively; web's
  `bg-inverse-surface/30 backdrop-blur` overlay divs are intentionally not ported (analysis §5 / menu
  shell brief step 7: translate backdrop-blur/fixed positioning to native modal).
- `bg-surface-container-lowest` matches the menu surface background the sidebar uses
  (`menu-sidebar.tsx:52`). Reconcile against plan 21's chosen root background if it differs.

---

## 7. Wire the chat top-bar trigger → open the menu route (EDIT, plan 16 `src/pages/chat/page.tsx`)

Replace the web/plan-16 *open-via-local-state* contract with *navigate to the modal route*. The chat
page no longer hosts the menu — it pushes `/menu`, and the route's native modal presentation does the
rest. This removes the `isMenuOpen` state, the `MenuOverlay` import, and the menu seam block (plan 16
§3 lines 138, 149, 206-209), satisfying simple-plan point 2 ("replace the previous open-via-local-state
contract with navigation").

**Edits (against the plan-16 on-disk `page.tsx`):**

1. Remove the import `import { MenuOverlay } from '@/layout/components/menu/menu-overlay'` (line 138).
2. Add `import { useRouter } from 'expo-router'` and `import { ROUTES } from '@/core/routes'`.
3. Remove `const [isMenuOpen, setIsMenuOpen] = useState(false)` (line 149). (Keep the
   `footerHeight` state; only the menu state goes.)
4. Add `const router = useRouter()` near the other top-of-component hooks.
5. Change the trigger:

```tsx
// before (plan 16, line 179):
<ChatTopBar onMenu={() => setIsMenuOpen(true)} />
// after:
<ChatTopBar onOpenMenu={() => router.push(ROUTES.menu)} />
```

6. Remove the MENU SEAM block (lines 206-209):

```tsx
// removed:
{/* MENU SEAM (plan 28): … */}
{isMenuOpen && <MenuOverlay onClose={() => setIsMenuOpen(false)} />}
```

Notes:
- **Prop name** — plan 14 Step 3 renamed the web `onMenu` to `onOpenMenu` to match this plan's
  contract; plan 16 §3 line 179 wired it as `onMenu` (the seam). **Use whatever `ChatTopBar` actually
  exports on disk** (plan 16 §5 reconciliation item 1 / §6). If it is `onMenu`, write
  `onMenu={() => router.push(ROUTES.menu)}`; if `onOpenMenu`, use that. Either way the handler is
  `() => router.push(ROUTES.menu)`.
- **`router.push` (not `replace`)** so the back gesture / dismiss returns to chat — the menu is a modal
  *over* chat, exactly like the web overlay sat over the chat page. `useRouter()` (hook) is used
  because the call is inside a render-scope event handler; the imported `router` singleton would also
  work, but the hook is the idiomatic in-component form.
- **`useState` import** stays only if `footerHeight` still uses it (it does — plan 16 line 148). Do not
  remove the React import.
- This is the single behavioral change to the chat page; the rest of plan 16's `page.tsx` (voice seam,
  footer layout, history) is untouched.

---

## 8. List-row routing (EDIT plan 25 views) + post-logout navigation (EDIT plan 26 settings)

### 8a. Task row → task workspace (EDIT `menu-tasks/menu-tasks-view.tsx`, plan 25)

Web's menu **does not** navigate from a task row (`menu-tasks-list.tsx` rows have no `onClick`). The
brief (step 3) and simple-plan (point 3) require mobile to: *tapping a task row navigates to the task
workspace and closes the menu*. Because the task workspace is a full route (`/tasks/[taskId]`), the
menu modal must be dismissed first, then navigate.

Add a per-row `onPress` that closes the menu modal and pushes the workspace route. The cleanest place
is the **view** (which owns the data + the menu store), threading an `onSelectTask(id)` into the list:

```tsx
// menu-tasks-view.tsx (additions)
import { useRouter } from 'expo-router'
import { ROUTES } from '@/core/routes'
// …
export function MenuTasksView() {
  const router = useRouter()
  // … existing useTaskListData + goBackToMenu …

  function handleSelectTask(taskId: string) {
    router.back()                       // dismiss the menu modal (reset fires on unmount)
    router.push(ROUTES.taskWorkspace(taskId))
  }
  // …
  <MenuTasksList tasks={tasks} onSelect={handleSelectTask} />
}
```

`MenuTasksList` (plan 25) passes `onSelect` down as `MenuListRow`'s `onPress` (the row already accepts
an `onPress`/`onClick` — `menu-list-row.tsx:17`), wiring each row to `() => onSelect(task.id)`. This
mirrors how the notes/reminders lists already thread `onSelect` (`menu-notes-list.tsx:10,21`).

Notes:
- **`router.back()` then `router.push(...)`** — dismissing the modal first means the menu's `reset()`
  (Menu screen unmount, §6) runs, then the workspace route is pushed onto the chat stack, leaving the
  user on the task workspace with the menu gone (brief step 3: "navigates … and closes the menu").
  Order matters: dismiss first so the modal doesn't sit over the pushed route. If on the target device
  `back()` + immediate `push()` races (modal still animating), the equivalent
  `router.replace(ROUTES.taskWorkspace(taskId))` from within the modal also satisfies "close the menu
  and go to the workspace" — pick whichever the on-disk navigator behaves correctly with; both honor
  the brief. Default to `back()` + `push()` (keeps chat in the back stack like web).
- **`onSelectTask` prop on `MenuTasksView`** — the §6 `Menu` screen passes
  `onSelectTask={(id) => router.back()}`? No: the navigation lives **inside** `MenuTasksView`
  (it owns the data + store). The §6 snippet's `<MenuTasksView onSelectTask={…} />` is therefore
  **simplified** — `MenuTasksView` needs no prop from the screen; it does the `router.back()` +
  `router.push` itself. **Correction for the implementer:** render `<MenuTasksView />` with no prop in
  §6, and put the navigation entirely in `menu-tasks-view.tsx` as shown here. (Keeping nav co-located
  with the data hook avoids prop-drilling and matches the frontend single-responsibility preference.)
- This is a coordinated edit to a plan-25 file: add the `useRouter`/`ROUTES` import, the
  `handleSelectTask`, and the `onSelect` prop on `MenuTasksList` (+ thread it to the row in
  `menu-tasks-list.tsx`). Do not change the data hook or the active/finished split.

### 8b. Note / reminder row → detail sub-sheet (no edit — already wired)

Notes and reminders already open the detail via the menu store: `menu-notes-view.tsx:32`
(`openDetail({ kind: 'note', id })`) and `menu-reminders-view.tsx:40`
(`openDetail({ kind: 'reminder', id })`). Plan 25 ports those views verbatim, so the detail
**sub-sheet** mounts from §6's `detailTarget` branch with **no edit** in this plan. Dismissing the
detail (`onClose` → `closeDetail`) returns to the list it came from (brief step 3 last line), because
the underlying `view` is unchanged while the sheet is open. The detail is rendered *over the menu
modal* (a stacked bottom sheet), satisfying simple-plan point 3 ("opens the … detail as its own native
modal, presented over the menu") without a second route — the analysis (§5) allows either; a stacked
sheet within the menu modal is the lighter realization and matches the web's nested-overlay structure.

> **Optional escalation (only if reconciliation shows plan 21's `MenuSheet` cannot stack within the
> modal):** promote note/reminder detail to dedicated modal routes
> `app/(protected)/notes/[noteId].tsx` + `app/(protected)/reminders/[reminderId].tsx`
> (each a thin adapter rendering `NoteDetail`/`ReminderDetail`), add `presentation: 'modal'` `Screen`
> entries in `_layout.tsx`, add `notesDetail`/`remindersDetail` to `routes.ts`, and change the list
> `onSelect` to `router.push(...)` instead of `openDetail`. This is **not** the default — the stacked
> sheet keeps `menu-store` as the single source of truth and avoids three extra route files. Only take
> it if the sheet-over-modal proves unworkable on-device.

### 8c. Settings post-logout navigation (EDIT `menu-settings/settings-view.tsx`, plan 26)

Plan 26 ships `SettingsView` calling `useAuthStore.getState().clear()` (or the `clear` selector) on
sign-out but **defers post-logout navigation to this plan** (plan 26 brief step 4). Add the
navigation: after `clear()` succeeds, `router.replace(ROUTES.login)`. Also accept the `onClose`
callback (from §6) so the sheet can be dismissed for the non-logout case (brief step 4: closing
settings returns to the menu without losing position).

```tsx
// settings-view.tsx (additions over plan 26's port)
import { useRouter } from 'expo-router'
import { ROUTES } from '@/core/routes'

type SettingsViewProps = {
  onClose: () => void
}

export function SettingsView({ onClose }: SettingsViewProps) {
  const router = useRouter()
  // … existing user + clear + signOutState …

  function handleSignOut() {
    setSignOutState('pending')
    try {
      clear()                         // plan 26 already drops Cookies.remove (web-only)
      router.replace(ROUTES.login)    // plan 28: post-logout navigation
    } catch {
      setSignOutState('failed')
    }
  }
  // SettingsSheet props unchanged; onClose used by the sheet's close affordance if present
}
```

Notes:
- **`router.replace(ROUTES.login)`** (not `push`) so the authed stack — chat, the open menu modal,
  any task route — is torn down and the back gesture cannot return to a logged-out protected screen.
  This is the mobile analog of web's `navigate(ROUTES.login)` after `Cookies.remove`
  (`settings-view.tsx:23-24`). The plan-09 guard + the api-client 401 handler are the other teardown
  authorities; an explicit `clear()` + `replace` here matches web's eager logout.
- **`clear()`** is plan 07's auth-store action (also clears SecureStore/AsyncStorage per plan 07/09).
  No cookie removal (web-only; plan 26 already stripped it). The `try/catch` + `signOutState` machine
  is plan 26's port of web `settings-view.tsx:9-27`; this plan only fills the navigation line.
- **`onClose`** lets the §6 screen pass `closeSettings`, so the settings sheet's own back/close control
  (and a backdrop tap, if plan 21's sheet exposes one) returns to the menu via the store
  (`closeSettings` keeps `view` intact → no lost position). If plan 26's `SettingsView` already takes
  no props and closes itself via `useMenuStore.closeSettings`, drop the `onClose` prop here and in §6
  (reconciliation rule).
- Coordinated edit to a plan-26 file: add `useRouter`/`ROUTES` import, the `router.replace` line, and
  (optionally) the `onClose` prop. Do not change the `SettingsSheet` presentational component.

---

## 9. Full flow trace (verifies the wiring end-to-end)

1. **Open menu:** chat screen → tap menu `IconButton` → `ChatTopBar` fires `onOpenMenu` →
   `router.push('/menu')` → expo-router presents `app/(protected)/menu.tsx` as a native modal
   (slide-up) → `Menu` reads `view === 'menu'` (store initial state) → renders `MenuSidebarView`
   (brand mark + 4 entries + counts).
2. **Switch views:** tap an entry → `MenuSidebar` `onSelect` → `selectEntry(id)`: `tasks`/`notes`/
   `reminders` set `view`, the screen swaps to `MenuTasksView`/`MenuNotesView`/`MenuRemindersView`;
   `settings` sets `isSettingsOpen` → the settings `MenuSheet` mounts over the current view. Each list
   view's back control → `goBackToMenu` → `view='menu'`.
3. **Task → workspace:** in `MenuTasksView`, tap a task row → `handleSelectTask(id)` →
   `router.back()` (dismiss modal → `Menu` unmount → `reset()`) → `router.push(ROUTES.taskWorkspace(id))`
   → `/tasks/{id}` route renders the task workspace; menu is gone, chat remains beneath.
4. **Note/reminder → detail:** tap a note/reminder row → `openDetail({ kind, id })` → `detailTarget`
   set → §6 renders `NoteDetail`/`ReminderDetail` in a bottom `MenuSheet` over the list → detail
   `onClose` → `closeDetail` → `detailTarget=null` → back to the same list (`view` unchanged).
5. **Settings:** from the main menu, `settings` entry → `isSettingsOpen` → settings sheet mounts;
   **Sign out** → `clear()` + `router.replace('/')` → login screen, authed stack discarded; **close**
   (no logout) → `onClose`→`closeSettings` → `isSettingsOpen=false`, menu still on `view='menu'`.
6. **Dismiss menu:** swipe-down / hardware back / `router.back()` on the modal → `Menu` unmounts →
   `reset()` clears `view`/`detailTarget`/`isSettingsOpen` → chat is revealed in its prior state.
   Re-opening starts fresh at the sidebar (matches web reset-on-close).

---

## 10. Things explicitly NOT done here

- **No new menu components** — `MenuSidebarView`, `MenuSheet`, `MenuListRow`, the three feature views,
  `NoteDetail`/`ReminderDetail`, `SettingsView`, `SettingsSheet` are owned by plans 21/25/26 and only
  consumed (notes/reminders detail wiring is already correct upstream).
- **No edits to the menu store** (plan 07) — `view`/`detailTarget`/`isSettingsOpen` + the actions are
  consumed as-is; the reset-on-dismiss reuses the existing `reset()`.
- **No detail route files by default** — note/reminder detail render as stacked sheets within the menu
  modal (§8b); the dedicated-route escalation is an explicit fallback only.
- **No changes to plan-09 guard logic** — only one child `Stack.Screen` is added for the modal
  presentation (§5).
- **No changes to the chat page beyond the trigger** — voice seam, footer, history untouched (§7).
- **No formatting / lint step.** Verification is type-check only.

## 11. Conventions honored

- kebab-case filenames; PascalCase component identifiers; one component per file; no barrel/index
  re-export files (user memory); path-alias `@/…` imports; no comments (the plan-16 seam comment is
  *removed*, not added); named exports except the two framework-required route defaults
  (`MenuScreen`, and the existing `ChatScreen`).
- **Routes declared via `routes.ts`** (frontend prefs) — `menu: '/menu'` added to the map; navigation
  uses `ROUTES.menu` / `ROUTES.taskWorkspace(id)` / `ROUTES.login`, never raw path literals at call
  sites.
- Page-structure: the menu screen lives in `src/pages/menu/page.tsx`; `app/(protected)/menu.tsx` is the
  thin expo-router adapter (mirrors chat/login).
- Navigation co-located with the data/store owner (task nav inside `MenuTasksView`, logout nav inside
  `SettingsView`) — single-responsibility, no prop-drilling of routers.

## 12. Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with zero errors across the new/edited files. Functional acceptance (brief step 6):
open the menu, switch between tasks/notes/reminders, navigate to a task workspace, open note and
reminder detail sheets, open/close settings, sign out — all end to end.

> If `tsc` fails solely on a differing export/prop from a dependency plan (a renamed `MenuSheet`,
> `NoteDetail` prop `id` vs `noteId`, `SettingsView` lacking `onClose`, `ChatTopBar` `onMenu` vs
> `onOpenMenu`, or a different `(protected)` group name), adjust only the corresponding
> import/prop/path line to match that plan's on-disk surface — no logic change. These are the
> documented integration seams (§1 reconciliation rule).
