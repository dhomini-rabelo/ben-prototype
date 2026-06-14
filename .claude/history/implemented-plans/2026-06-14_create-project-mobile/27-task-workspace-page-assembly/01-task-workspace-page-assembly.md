# Deep Plan 27 — Task workspace page assembly + route (project-mobile)

> **DO NOT IMPLEMENT YET.** Code-level implementation plan only.
> **SYNC unit:** runs **alone** after the parallel task-component plans (22 content, 23 bars/banners, 24 footer/overlay) have produced their pieces, and after the task-workspace logic cluster (plan 20) and the voice store (plan 17) exist. It **composes** those pieces into the page and **owns the new route file** — it must not run in parallel with 22/23/24 because it imports across all three ownership boundaries.

---

## 1. Context

### What this unit does

Port `project-web/src/pages/task-workspace/page.tsx` (read in full — 128 lines) to React Native / Expo, assembling the already-built mobile workspace parts into `project-mobile/src/pages/task-workspace/page.tsx`, and register the expo-router dynamic screen at `project-mobile/app/(protected)/tasks/[taskId].tsx`.

The web page is a composition shell with lifecycle handling. Its responsibilities (web `page.tsx`):

1. Read the `taskId` route param (`useParams`) and fetch the task via `useTaskDetailData(taskId)` (web lines 23–25).
2. Publish the id into the root store via `setTaskId(taskId)` on mount and `useTaskStore.getState().reset()` on unmount (web lines 41–44).
3. Activate connectivity tracking via `useConnectivity()` (web line 31).
4. Register the **voice transcript handler** → `useTaskChatStore.sendText` (web lines 33–37) and subscribe mic permission (web line 39).
5. Render **loading** and **error** lifecycle states (loading copy; error with Retry + Back-to-chat) (web lines 59–93).
6. Layout: fixed header (top bar + top banner), scrollable main, fixed footer (sub-thread banner + diff bar + footer), reserving bottom padding equal to the measured footer height (`ResizeObserver` → `footerHeight + FOOTER_GAP`) (web lines 46–57, 98–123).
7. Switch the main content on `task.contentType`: `TodoContent` for `"todo"`, else `TextContent`; pass the `readOnly` flags (`isFinished`; text also read-only on `hasPendingDiff`) (web lines 95–96, 109–113).
8. Mount the `WorkspaceDoneOverlay` when finished (web line 125).

### Web → mobile deltas this unit must apply (from `MOBILE-PORT-ANALYSIS.md`)

| Web concern | Mobile replacement | Source |
|---|---|---|
| `ResizeObserver` on footer (web `page.tsx:46-57`) | footer `onLayout` → `event.nativeEvent.layout.height` | analysis §106 "ResizeObserver → onLayout" |
| Keyboard covering the input/footer | `KeyboardAvoidingView` wrapping the footer | analysis §111 |
| Notch / home indicator | `SafeAreaView` / safe-area insets (`react-native-safe-area-context`, scaffolded plan 01) | analysis §112 |
| `navigator.onLine` connectivity | `useConnectivity()` over NetInfo — same hook name/contract (plan 07) | analysis §113 |
| `useParams<{taskId}>()` (react-router) | `useLocalSearchParams<{taskId}>()` (expo-router) — read in the **route file**, fed to the store; the page itself does not re-read the param | analysis §27, plan 20 Adjustment B |
| `useNavigate()` + `navigate(ROUTES.chat)` | `useRouter()` from expo-router → `router.replace(ROUTES.chat)` (error-state "Back to chat") | analysis §27 |
| `fixed`/`max-w-120`/`-translate-x-1/2` centered column | RN flex layout; absolute-positioned header/footer; drop the 480px desktop cap (full-width screen) | analysis §"UI" |
| `<div>/<header>/<main>/<footer>` + Tailwind | `View`/`SafeAreaView`/`KeyboardAvoidingView`/`ScrollView` (+ NativeWind `className`) | analysis §"UI primitives" |
| `min-h-dvh`, `dvh` units | RN `flex-1` | analysis §"UI" |
| Footer record button auto-wired inside `ChatInput.ActionButton` | footer exposes an `onStartRecording` prop wired **here** → `useVoiceStore.startRecording` | plan 24 step 2, plan 15/19 precedent (see §3.5) |

### Cross-plan boundary (what already exists when this runs)

All imported via the `@/` alias (plan 01 wired babel module-resolver + tsconfig paths). This unit **creates no component or store** — it only imports and composes. The composition target below is fixed; **the exact import specifiers are reconciled at implementation time against the on-disk files** the owning plans produced (NO GUESSING — if a parallel plan renamed/relocated a piece, adapt the import, do not invent one).

| Import | Owner | Web analog |
|---|---|---|
| `useTaskDetailData` → `@/layout/hooks/api/use-task-detail-data` | plan 08 | `@/layout/hooks/api/use-task-detail-data` |
| `useTaskStore` (`setTaskId`, `reset`) → `@/pages/task-workspace/stores/task-store` | plan 20 | `./stores/task-store` |
| `useTaskChatStore` (`sendText`) → `@/pages/task-workspace/stores/task-chat-store` | plan 20 | `./stores/task-chat-store` |
| `useVoiceStore` (`setTranscriptHandler`, `subscribeMicPermission`, `startRecording`) → `@/layout/stores/voice-store` | plan 17 | `@/layout/stores/voice-store` |
| `useConnectivity` → `@/layout/hooks/use-connectivity` (NetInfo-backed) | plan 07 | `@/layout/hooks/use-connectivity` |
| `ROUTES` → `@/core/routes` (`ROUTES.chat`) | plan 01 | `@/core/routes` |
| `WorkspaceTopBar` → `@/pages/task-workspace/components/workspace-top-bar/workspace-top-bar` | plan 23 | same |
| `WorkspaceTopBanner` → `@/pages/task-workspace/components/workspace-top-banner` | plan 23 | same |
| `WorkspaceSubThreadBanner` → `@/pages/task-workspace/components/workspace-sub-thread-banner` | plan 23 | same |
| `DiffBar` → `@/pages/task-workspace/components/diff-bar/diff-bar` | plan 22 | same |
| `TextContent` → `@/pages/task-workspace/components/text-content/text-content` | plan 22 | same |
| `TodoContent` → `@/pages/task-workspace/components/todo-content/todo-content` | plan 22 | same |
| `WorkspaceFooter` → `@/pages/task-workspace/components/workspace-footer/workspace-footer` | plan 24 | same |
| `WorkspaceDoneOverlay` → `@/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay` | plan 24 | same |
| `Typography` → `@/layout/components/ui/typography` | plan 05 | `@/layout/components/ui/typography` |
| `IconButton`/`Button` (error-state actions) → `@/layout/components/ui/*` | plan 05 | web used raw `<button>` |

> **Import-name verification rule (NO GUESSING):** before writing imports, confirm each named export above against the file the owning plan actually produced (e.g. `WorkspaceTopBanner` may be a single file `workspace-top-banner.tsx` or a folder; `TextContent`/`TodoContent` take a `readOnly` prop — confirm the prop name). The component pieces are exported as on web (`WorkspaceTopBar` is `memo`-wrapped, `TextContent`/`TodoContent` are `({ readOnly })`), so the composition is a 1:1 mirror; reconcile any divergence to the real export.

### Voice/footer wiring nuance (web vs mobile — load-bearing)

On **web**, the workspace footer's record button is wired **inside** the shared `ChatInput.ActionButton` (it pulls `startRecording` from `useVoiceStore` itself); web `page.tsx` therefore only registers the **transcript handler** (web lines 33–37). On **mobile**, plans 15/19/24 deliberately moved record-button wiring out of the shared input and onto an **`onStartRecording` prop** on the footer, wired at the page-assembly step. The task brief for plan 27 explicitly requires "footer record → `useVoiceStore.startRecording`". So this unit must, in addition to the transcript handler:

- Pass `onStartRecording` (gated/raw per the footer's real contract) into `<WorkspaceFooter />` → `useVoiceStore.getState().startRecording()`.

This is the workspace analog of what plan 19 did for the chat footer; there is no separate "voice-task integration" plan, so the wiring lands **here**. (See §3.5 for the exact prop reconciliation.)

---

## 2. Files owned by this unit

Both under `project-mobile/`, both **created** by this plan (nothing else is touched):

1. `src/pages/task-workspace/page.tsx` — the `TaskWorkspace` composition component.
2. `app/(protected)/tasks/[taskId].tsx` — the expo-router dynamic screen that reads `taskId`, feeds `useTaskStore`, and renders `TaskWorkspace`.

Conventions honored (per `page-structure`, frontend prefs, user memory):
- kebab-case filenames; `TaskWorkspace` stays PascalCase.
- `@/`-alias imports, never deep relative.
- No code comments **except** the two load-bearing seam markers below if a sibling piece is missing on disk.
- One component per file. No barrel/index-only files (user memory rule).

---

## 3. `src/pages/task-workspace/page.tsx`

### 3.1 Where `taskId` comes from (key port decision)

Web reads the param inside `page.tsx` (`useParams`), sets `setTaskId`, **and** fetches `useTaskDetailData(taskId)` there. On mobile, plan 20's `use-workspace-task.ts` reads the param via `useLocalSearchParams` and the footer/content pieces already consume the task through `useWorkspaceTask()`. To keep the page a faithful 1:1 port **and** match plan 20's seam, this unit:

- Reads the `taskId` it needs from the **root store** (`useTaskStore`), which the route file (§4) populates from `useLocalSearchParams` before rendering the page — this avoids re-reading the param in two places and keeps the page param-source-agnostic.
- Fetches `useTaskDetailData(taskId)` for the **lifecycle states (loading / error)** and the **content-type switch / readOnly flags**, exactly as web does.

> Rationale (NO GUESSING / closest 1:1): the route file owns the param→store hop (§4), so the page reads `taskId` from `useTaskStore` and calls `useTaskDetailData(taskId)`. This preserves web's data flow (page owns the fetch + lifecycle + content switch) while honoring plan 20's `useLocalSearchParams` location (the param is read once, in the route file). `setTaskId`/`reset` still run on the page mount/unmount, mirroring web `page.tsx:41-44`, so child stores observe the id even though the route file also set it (idempotent `set({ taskId })`).

### 3.2 Footer height via `onLayout` (replaces `ResizeObserver`)

Web measures the fixed footer with `ResizeObserver` (web lines 46–57) and feeds `footerHeight + FOOTER_GAP` into `main`'s `paddingBottom` so content clears the fixed footer. RN equivalent:

```tsx
const [footerHeight, setFooterHeight] = useState(0);

function handleFooterLayout(event: LayoutChangeEvent) {
  setFooterHeight(event.nativeEvent.layout.height);
}
```

- `onLayout` fires on mount and on every size change (sub-thread banner / diff bar appearing or disappearing, footer growing for multi-line input) — covering exactly the cases `ResizeObserver` did.
- `FOOTER_GAP = 16` preserved from web (`page.tsx:19`).
- `footerHeight + FOOTER_GAP` becomes the `ScrollView` content-container `paddingBottom` (the main region is a plain `ScrollView`, not an inverted list — unlike chat). This mirrors web's `main` `paddingBottom`.

### 3.3 Keyboard + safe areas

- `SafeAreaView` (from `react-native-safe-area-context`) wraps the screen with `edges={['top', 'bottom']}` so the header clears the notch and the footer clears the home indicator. `SafeAreaProvider` is mounted at the root (`app/_layout.tsx`, plan 01).
- `KeyboardAvoidingView` wraps **only the footer** with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` (same split as the chat page, plan 16 §3.3) — lifts the input above the keyboard without shifting the absolutely-positioned header. `keyboardVerticalOffset` is `0` because the screen hides the native nav header (§4).
- The main `ScrollView` keeps its content above the fixed footer via the bottom padding from §3.2; the header is absolutely positioned, so content scrolls beneath it as on web.

> Rationale for footer-only `KeyboardAvoidingView` (vs. whole-screen): wrapping everything would also shift the absolutely-positioned header. Footer-only keeps the header pinned and only floats the input — matching web intent and the chat-page precedent (plan 16).

### 3.4 Lifecycle states (loading / error)

Ported 1:1 from web `page.tsx:59-93`, swapping DOM for RN primitives and the web raw `<button>`s for the mobile UI primitives (plan 05). Copy logic verbatim:

- **Loading** (`state.isLoading`): centered `Typography` "loading your workspace…".
- **Error** (`state.isError || !task`): centered column with copy "couldn't load this one", a **Retry** action (`actions.refetch()`) and a **Back to chat** action (`router.replace(ROUTES.chat)`).

The exact button primitive (`Button` vs `IconButton` vs `Pressable`) is reconciled against plan 05's export; web used two pill `<button>`s with `bg-primary` / `bg-surface-container-high`. Preserve the copy and the two actions; render them with whatever button primitive plan 05 ships (e.g. a `Button` with a `variant`), keeping the same tokens.

### 3.5 Component composition

Mirrors web `page.tsx:98-127` 1:1 in structure, swapping DOM for RN + applying the deltas.

```tsx
import { useEffect, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ROUTES } from "@/core/routes";
import { Typography } from "@/layout/components/ui/typography";
import { Button } from "@/layout/components/ui/button";
import { useTaskDetailData } from "@/layout/hooks/api/use-task-detail-data";
import { useConnectivity } from "@/layout/hooks/use-connectivity";
import { useVoiceStore } from "@/layout/stores/voice-store";
import { DiffBar } from "@/pages/task-workspace/components/diff-bar/diff-bar";
import { TextContent } from "@/pages/task-workspace/components/text-content/text-content";
import { TodoContent } from "@/pages/task-workspace/components/todo-content/todo-content";
import { WorkspaceDoneOverlay } from "@/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay";
import { WorkspaceFooter } from "@/pages/task-workspace/components/workspace-footer/workspace-footer";
import { WorkspaceSubThreadBanner } from "@/pages/task-workspace/components/workspace-sub-thread-banner";
import { WorkspaceTopBanner } from "@/pages/task-workspace/components/workspace-top-banner";
import { WorkspaceTopBar } from "@/pages/task-workspace/components/workspace-top-bar/workspace-top-bar";
import { useTaskChatStore } from "@/pages/task-workspace/stores/task-chat-store";
import { useTaskStore } from "@/pages/task-workspace/stores/task-store";

const FOOTER_GAP = 16;

export function TaskWorkspace() {
  const router = useRouter();
  const taskId = useTaskStore((store) => store.taskId);
  const setTaskId = useTaskStore((store) => store.setTaskId);
  const { state, actions } = useTaskDetailData(taskId);
  const task = state.data?.item ?? null;

  const [footerHeight, setFooterHeight] = useState(0);

  useConnectivity();

  useEffect(() => {
    useVoiceStore.getState().setTranscriptHandler((text) => {
      void useTaskChatStore.getState().sendText(text);
    });
  }, []);

  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), []);

  useEffect(() => {
    setTaskId(taskId);
    return () => useTaskStore.getState().reset();
  }, [taskId, setTaskId]);

  function handleFooterLayout(event: LayoutChangeEvent) {
    setFooterHeight(event.nativeEvent.layout.height);
  }

  if (state.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface px-6">
        <Typography variant="body-md" className="text-on-surface-variant">
          loading your workspace…
        </Typography>
      </SafeAreaView>
    );
  }

  if (state.isError || !task) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-surface px-6">
        <Typography variant="body-md" className="text-on-surface-variant">
          couldn't load this one
        </Typography>
        <View className="flex-row gap-2">
          <Button variant="primary" onPress={() => void actions.refetch()}>
            Retry
          </Button>
          <Button variant="secondary" onPress={() => router.replace(ROUTES.chat)}>
            Back to chat
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isFinished = task.status === "finished";
  const hasPendingDiff = task.pendingDiff !== null;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
      <View className="flex-1">
        <View className="absolute inset-x-0 top-0 z-50 bg-surface">
          <WorkspaceTopBar />
          <WorkspaceTopBanner />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 64,
            paddingBottom: footerHeight + FOOTER_GAP,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {task.contentType === "todo" ? (
            <TodoContent readOnly={isFinished} />
          ) : (
            <TextContent readOnly={isFinished || hasPendingDiff} />
          )}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="absolute inset-x-0 bottom-0 z-50"
        >
          <View
            onLayout={handleFooterLayout}
            className="flex-col gap-2 bg-surface px-4 pt-2 pb-2"
          >
            <WorkspaceSubThreadBanner />
            <DiffBar />
            <WorkspaceFooter
              onStartRecording={() => useVoiceStore.getState().startRecording()}
            />
          </View>
        </KeyboardAvoidingView>

        {isFinished && <WorkspaceDoneOverlay />}
      </View>
    </SafeAreaView>
  );
}
```

> **`WorkspaceFooter` `onStartRecording` reconciliation (NO GUESSING).** Plan 24's footer exposes a record callback prop wired here (its brief step 2; web auto-wired it inside `ChatInput.ActionButton`). Confirm the exact prop name plan 24 declared:
> 1. If plan 24's footer takes `onStartRecording?: () => void` (the plan-15 chat-footer precedent) → pass `() => useVoiceStore.getState().startRecording()` as shown, or the selector form `const startRecording = useVoiceStore((s) => s.startRecording)` passed directly if the footer's record button already self-gates on `useCanRecord()`.
> 2. If plan 24's footer instead reproduced web exactly (record wired internally via the shared `ChatInput.ActionButton`, no prop) → **omit** the prop; the footer is already self-wired and the page only needs the transcript handler (web parity). Do not add a prop the footer does not declare.
>
> The invariant is fixed (record → `useVoiceStore.startRecording`, gated by `useCanRecord` somewhere); the prop plumbing follows plan 24's real contract. Prefer branch 1 (matches the mobile chat precedent and this plan's brief).

> **`Button` primitive reconciliation (§3.4).** The error-state actions use whatever button primitive plan 05 exports (`Button` with `variant`, or `IconButton`+label, or a styled `Pressable`). The two actions and their copy are fixed; the primitive/`variant` names are reconciled against plan 05's on-disk export.

> **Header clearance constant.** Web added `pt-16` (64px) to `main` to clear the fixed header (top bar + banner ≈ 64px). Here `paddingTop: 64` mirrors that. If plans 23/05 expose a header-height token/constant, use it instead of the literal `64` (do not hardcode if a constant exists). The banner row only renders conditionally (offline/voice-error/denied), so an exact match is non-critical; 64 matches web's chosen clearance.

> **Sub-thread banner / diff bar self-hiding.** Both `WorkspaceSubThreadBanner` and `DiffBar` already render `null` when there is nothing to show (web parity — `DiffBar` hides when no pending diff; the sub-thread banner hides per its priority selection). The page mounts them unconditionally exactly as web does; `onLayout` re-measures the footer when they appear/disappear (§3.2).

### 3.6 What is intentionally NOT in this file

- **No `useParams`/`useLocalSearchParams`** — the param is read in the route file (§4) and reaches the page via the store (§3.1).
- **No `ResizeObserver`, no `useLayoutEffect`, no DOM refs, no `footerRef`** (replaced by `onLayout`).
- **No `min-h-dvh`, `max-w-120`, `-translate-x-1/2`, `fixed`** (web desktop-column artifacts dropped).
- **No voice-store logic / recorder code** — only the transcript-handler registration, mic-permission subscription, and the footer `onStartRecording` wiring (the store internals are plan 17).
- **No content/footer/banner/overlay component bodies** — owned by plans 22/23/24.
- **No `task-store`/`task-chat-store` definitions** — owned by plan 20.

---

## 4. `app/(protected)/tasks/[taskId].tsx` (expo-router dynamic screen)

Thin route adapter: reads `taskId` from the route, feeds it into `useTaskStore`, configures the screen, and renders `TaskWorkspace`. Lives under the auth-gated `(protected)` group (created by the auth plan 09; this unit only places the file in it, it does not own the group `_layout.tsx`). The bracket segment `[taskId]` makes the param key `taskId` — identical to web's `:taskId` (`ROUTES.taskWorkspace`).

```tsx
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { TaskWorkspace } from "@/pages/task-workspace/page";
import { useTaskStore } from "@/pages/task-workspace/stores/task-store";

export default function TaskWorkspaceScreen() {
  const { taskId = "" } = useLocalSearchParams<{ taskId: string }>();
  const setTaskId = useTaskStore((store) => store.setTaskId);

  useEffect(() => {
    setTaskId(taskId);
  }, [taskId, setTaskId]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TaskWorkspace />
    </>
  );
}
```

- `useLocalSearchParams<{ taskId: string }>()` with the `= ""` default narrows to `string` exactly like web's `useParams` (plan 20 Adjustment B). The bracket file route `tasks/[taskId].tsx` resolves to `/tasks/:taskId`, matching `ROUTES.taskWorkspace(taskId)` (plan 01).
- `headerShown: false` because the page renders its own `WorkspaceTopBar`/`WorkspaceTopBanner` (web has no native nav header). This also keeps `keyboardVerticalOffset={0}` correct (§3.3).
- The route file sets `taskId` into the store so `TaskWorkspace` (and every child store/hook) reads it via `useTaskStore` (§3.1). The page also re-affirms `setTaskId(taskId)` on its own mount and owns the `reset()` on unmount (web `page.tsx:41-44`), so the unmount cleanup lives where web placed it.
- Default export named `TaskWorkspaceScreen` (expo-router requires a default export per route file). `TaskWorkspace` stays the named feature component in `page.tsx`, matching the web export and keeping the route file a pure adapter.

> **`(protected)` group existence flag (NO GUESSING).** If the auth plan (09) created the protected group with a different name (e.g. `(app)` / `(auth)`), place `tasks/[taskId].tsx` in whatever auth-gated group exists on disk and ensure the resulting path stays `/tasks/:taskId`. If no protected group exists yet when this unit lands, place the file at `app/tasks/[taskId].tsx` and leave a one-line seam note that plan 28/09 relocates it into the group — the screen resolves identically either way. (Mirrors plan 16 §4 for the chat screen.)

> **Param→store double-set rationale.** Both the route file and the page run `setTaskId(taskId)` (`set({ taskId })` is idempotent). The route file guarantees the store has the id before the page's first render/fetch (so `useTaskDetailData(taskId)` and child hooks read a populated id immediately); the page keeps the `reset()` cleanup on unmount to match web exactly. If reconciliation prefers a single source, keep the set in the **page** (web parity) and have the route file only render `<TaskWorkspace />` while the page reads `useLocalSearchParams` itself — but the split above is the closer match to plan 20's "param read via `useLocalSearchParams`, store fed by the route" seam. Pick one source; do not set it in three places.

---

## 5. Reconciliation checklist (before writing imports)

Because this is a sync unit composing three parallel outputs, the implementer must, **before writing imports**, confirm each against the on-disk file the owning plan produced:

1. `WorkspaceFooter` record prop name + whether it self-wires recording (§3.5 branch selection).
2. `TextContent` / `TodoContent` `readOnly` prop name (plan 22) — web uses `readOnly`.
3. `WorkspaceTopBanner` / `WorkspaceSubThreadBanner` export shape (single file vs folder) (plan 23).
4. `DiffBar` self-hides when no pending diff (plan 22) — confirm it renders `null`, so the page mounts it unconditionally (web parity).
5. `Button`/error-action primitive + `variant` names (plan 05) (§3.4).
6. `useConnectivity` exists at `@/layout/hooks/use-connectivity` (NetInfo-backed) with a no-arg call (plan 07).
7. `useTaskStore`/`useTaskChatStore` export names + `setTaskId`/`reset`/`sendText` shapes (plan 20).
8. `useVoiceStore` exposes `setTranscriptHandler`, `subscribeMicPermission`, `startRecording` (plan 17 — copy-intact, identical to web).
9. `(protected)` group name + dynamic-route placement (§4).
10. A header-height token/constant from plans 23/05, if any, to replace the literal `64` (§3.5).

None of these change the composition shape — they only pin the exact specifiers. Where a sibling diverges, adapt the import; never redefine the component/store here.

---

## 6. Verification

From `project-mobile/`:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with zero errors. This exercises: the `@/` alias resolution to all imported pieces, NativeWind `className` typing on RN `View`/`SafeAreaView`/`KeyboardAvoidingView`/`ScrollView`, the `LayoutChangeEvent` type, the expo-router `useRouter`/`useLocalSearchParams`/`Stack.Screen` types, and the route file's default export.

**No formatting/lint step** (no `prettier`/`lint:fix`) — per task instruction.

Functional expectation (manual, not gated by tsc): navigating to a task (`/tasks/:taskId`) renders the workspace end-to-end — header (top bar + banner), the correct content for the task's `contentType` (todo list vs editable text, with `readOnly` honored when finished / on a pending text diff), the sub-thread banner + diff bar + footer, the done overlay when finished, loading and error lifecycle states, the keyboard lifting the footer, and the footer record button starting a voice recording (transcript flows back into the task chat via the registered handler).

> If `tsc` fails on any imported piece, the failure is an **upstream gap** in plans 17/20/22/23/24/05/07/08 (a piece not yet built or a renamed export), not in this unit — reconcile per §5, do not stub the missing piece here.

---

## 7. Out of scope (owned by other plans)

- All workspace sub-components: content/todo/diff (plan 22), top bar + banners (plan 23), footer + done overlay (plan 24).
- The task-workspace logic cluster — stores, atoms, utils, `use-workspace-task`/`use-workspace-input` hooks (plan 20).
- The voice store + recorder + mic-permission (plan 17); this unit only registers the transcript handler, subscribes mic permission, and wires the footer record callback.
- `useConnectivity`/NetInfo (plan 07), `useTaskDetailData` (plan 08), UI primitives + tokens (plans 03/05).
- The `(protected)` group `_layout.tsx` and auth gating (plan 09).
- `src/core/routes.ts` (already provides `ROUTES.chat` and `ROUTES.taskWorkspace`, plan 01).
- Menu wiring (plan 21/28).
```