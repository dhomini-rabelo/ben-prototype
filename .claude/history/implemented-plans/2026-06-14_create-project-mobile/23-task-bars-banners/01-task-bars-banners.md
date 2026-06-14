# Implementation Plan 23 — Task-workspace top bar + banners (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively:**
> - `project-mobile/src/pages/task-workspace/components/workspace-top-bar/`
> - `project-mobile/src/pages/task-workspace/components/workspace-top-banner.tsx`
> - `project-mobile/src/pages/task-workspace/components/workspace-sub-thread-banner.tsx`
> - `project-mobile/src/pages/task-workspace/components/sub-thread-banner/`
> **Parallel-safe:** distinct folders from plans 22 (`task-content*`), 24 (`task-footer*`/overlays), 25/26 (menu), 27 (page assembly). Touches nothing outside the four owned locations.
> **Depends on:** plan 20 (task logic: `useWorkspaceTask`, `useTaskLifecycleStore`, `useTaskChatStore`, `taskDraftAtom`), plan 05 (UI primitives: `Typography`, `IconButton`), plan 11 (shared `ChatBanner` namespace), plan 03 (tokens + `cn()`), plan 07/17 (`voice-store`/`connectivity-store`), plan 12 (`BouncingDots` Reanimated primitive), plan 01 (`@/core/routes`, `expo-router`, `lucide-react-native`).
> **Verification:** `cd project-mobile && npx tsc --noEmit`. **No formatting/lint step** for this unit.
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port the four web task-workspace shell pieces to React Native / Expo (NativeWind v4), keeping NativeWind classNames byte-for-byte where an RN equivalent exists:

- **`workspace-top-bar`** — back-nav control (leading) + task identity (centered: content-type badge + truncated title + finished marker) + a "More" lifecycle-actions trigger (trailing) opening a Finish/Reopen menu. Renders `null` when no task is loaded.
- **`workspace-top-banner`** — environmental-alert banner (offline / voice error / mic denied) over the shared `ChatBanner` namespace.
- **`workspace-sub-thread-banner`** — selector that picks one `SubThreadBanner` variant from task + voice + chat state, preserving the web priority order.
- **`sub-thread-banner`** — presentational banner with four variants (`ben-reply`, `user-pending`, `ben-typing`, `error`), the animated dots reusing plan-12's `BouncingDots`.

### Web references (read in full)
- `project-web/src/pages/task-workspace/components/workspace-top-bar/workspace-top-bar.tsx`
- `project-web/src/pages/task-workspace/components/workspace-top-banner.tsx`
- `project-web/src/pages/task-workspace/components/workspace-sub-thread-banner.tsx`
- `project-web/src/pages/task-workspace/components/sub-thread-banner/sub-thread-banner.tsx`

### RN mapping applied (same table plans 05/11/14 use)

| web | mobile |
|---|---|
| `<div>` | `View` |
| `<button>` | `Pressable` (or `IconButton` for the icon-only controls) |
| `<span>` / text | `Text` / `Typography` (wraps `Text`) |
| `onClick` | `onPress` |
| `aria-label` | `accessibilityLabel` |
| `hover:` / `transition-*` / `truncate` | dropped; pressed feedback via the `pressed` callback; truncation via `numberOfLines={1}` |
| `lucide-react` | `lucide-react-native` (numeric `size`/`color`, **not** `size-*`/`text-*` classes) |
| CSS `animate-bounce` dots | plan-12 `BouncingDots` (Reanimated) |
| `react-router` `useNavigate` | `expo-router` `router.replace` |

### Token hex values (from plan 03 — for `lucide-react-native` `color` props)

`lucide-react-native` icons need a `color` string, not a Tailwind class. Define small file-local consts from the confirmed plan-03 palette:

```ts
const ON_SURFACE_VARIANT = "#444748";
const ON_SURFACE = "#1a1c1c";
const TEXT_ERROR = "#c53030";
```

> Same approach plans 11/14 chose. If plan-03/05 later expose an SVG-color cssInterop that lets `className="text-*"` paint the icon, the consts can be replaced — but the explicit `color` prop is the safe, portable default and keeps the change inside this folder.

---

## Prerequisite contracts (delivered by dependency plans — verify with `tsc`, do not create here)

From plan 20 (`src/pages/task-workspace/`):
- `useWorkspaceTask()` (`@/pages/task-workspace/hooks/use-workspace-task`) → `Task | null`. `Task` fields used: `title: string`, `contentType: "text" | "todo"`, `status: "created" | "active" | "finished"`, `pendingDiff`.
- `useTaskLifecycleStore` (`@/pages/task-workspace/stores/task-lifecycle-store`) → `{ finish: () => Promise<boolean>, reopen: () => Promise<void>, isMutating: boolean }`.
- `useTaskChatStore` (`@/pages/task-workspace/stores/task-chat-store`) → `{ isAwaitingReply: boolean, sendError: boolean, lastBenReply: string | null, sendText: (content: string) => Promise<boolean> }`.
- `taskDraftAtom` (`@/pages/task-workspace/states/task-workspace-state`) — Jotai atom, read with `useAtomValue`.

From plan 05 (`src/layout/components/ui/`):
- `Typography` — `{ variant, className?, children, ...TextProps }`; variants include `body-md`, `label-caps`. Renders over `Text`, so it accepts `numberOfLines` for truncation.
- `IconButton` — `{ label, children, className?, onPress? }`; `label`→`accessibilityLabel`; **does not color its icon child** (plan 05 Step 2) — the icon must carry its own `color`.

From plan 11 (`src/layout/components/chat-banner`):
- `ChatBanner` namespace `{ Root, Icon, Text, Action, Dismiss }`. `Root` `{ tone?: "info"|"warn"|"error", children, className? }`; `Icon` `{ icon }`; `Text` `{ children }`; `Action` `{ label, onPress? }`; `Dismiss` `{ onPress? }`. (`onClick`→`onPress` per plan 11.)

From plan 07/17 (`src/layout/stores/`):
- `useConnectivityStore` — selector `(store) => store.isOffline`.
- `useVoiceStore` + `selectVoiceStatus` (`@/layout/stores/voice-store`) — `selectVoiceStatus` → `"idle"|"recording"|"transcribing"|"error"`; store exposes `retryVoice()`, `dismissError()`, `micPermission: "granted"|"denied"|"prompt"`.

From plan 12 (`src/pages/chat/components/bouncing-dots`):
- `BouncingDots` — `{ size?: number, className? }`. Reanimated row of three staggered dots (`bg-on-surface-variant`), the RN replacement for web's `animate-bounce` dot spans. **Reused here** rather than reimplementing the bounce animation (cross-page primitive; consuming it does not violate parallel-safety — it is read-only).

From plan 01:
- `ROUTES` (`@/core/routes`) — `{ chat: "/chat", … }`.
- `router` (`expo-router`) — `router.replace(path)` (the auth-flow plan 09 establishes `import { router } from "expo-router"` + `router.replace(ROUTES.chat)` as the canonical navigation form).
- Deps present: `lucide-react-native`, `react-native-reanimated`, `nativewind`, `expo-router`.

> If any prerequisite import is absent at implementation time, **do not add it here** — `tsc` surfaces it as an upstream dependency gap (plans 01/03/05/07/11/12/17/20), not this unit. Only the single failing import line may be touched.

---

## Step 1 — `workspace-top-bar/workspace-top-bar.tsx`

Three-region horizontal bar: leading back control, centered task identity, trailing "More" trigger that toggles an absolutely-positioned Finish/Reopen menu. Renders `null` when no task is loaded.

### Web→RN decisions
- `useNavigate()` + `navigate(ROUTES.chat)` → `expo-router` `router.replace(ROUTES.chat)` (matches plan 09's navigation form; web used `navigate` which replaces the workspace route — `replace` is the closer 1:1 since the workspace is left, not stacked).
- `useState(false)` for `isMenuOpen` is platform-agnostic — copy intact.
- Both icon-only controls (`ChevronLeft` back, `MoreHorizontal` more) → raw `Pressable` keeping the web's exact `size-10 … rounded-full text-on-surface-variant` classes (NOT `IconButton`, because the web buttons use `size-10` + `hover:bg-surface-container-low` whereas `IconButton`'s pressed bg is `surface-container-high`; to preserve the web look 1:1 we keep the original classes and drop hover). The lucide icons carry `color={ON_SURFACE_VARIANT}` themselves.
- Title `<Typography variant="body-md" className="truncate …">` → keep classes, drop `truncate`, add `numberOfLines={1}` (RN truncation). Wrap in a `flex-1` parent so it can shrink.
- Content-type badge `<span>` → `View`; the `TypeIcon` (`List` for `todo`, `Type` otherwise) gets `color={ON_SURFACE_VARIANT}`.
- Finished marker `<span>` → `Text` keeping the `font-mono text-[10px] uppercase tracking-wider` classes verbatim.
- The dropdown `<div className="absolute top-12 right-2 z-10 …">` → an absolutely-positioned `View`; absolute positioning works in RN, keep the classes (drop `shadow-[…]` only if NativeWind rejects it at build — non-load-bearing). The menu buttons → `Pressable` keeping `disabled={isMutating}` + `disabled:opacity-60` rewritten as `disabled && "opacity-60"` (NativeWind `disabled:` is unreliable on `Pressable`, per plans 05/11). Each menu row wraps its label in `Text` (RN cannot put a bare string beside an icon in a `Pressable`) and the lucide icon (`RotateCcw`/`CheckCircle2`) carries `color={ON_SURFACE}`.
- `handleFinish`/`handleReopen` logic copied intact; only `navigate(ROUTES.chat)` → `router.replace(ROUTES.chat)`.
- `flex … justify-between` → `flex-row … justify-between` (RN defaults to column).
- `memo` kept.

```tsx
import {
  CheckCircle2,
  ChevronLeft,
  List,
  MoreHorizontal,
  RotateCcw,
  Type,
} from "lucide-react-native";
import { memo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ROUTES } from "@/core/routes";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { useTaskLifecycleStore } from "@/pages/task-workspace/stores/task-lifecycle-store";

const ON_SURFACE_VARIANT = "#444748";
const ON_SURFACE = "#1a1c1c";

function WorkspaceTopBarComponent() {
  const task = useWorkspaceTask();
  const finish = useTaskLifecycleStore((store) => store.finish);
  const reopen = useTaskLifecycleStore((store) => store.reopen);
  const isMutating = useTaskLifecycleStore((store) => store.isMutating);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!task) {
    return null;
  }

  const TypeIcon = task.contentType === "todo" ? List : Type;
  const isFinished = task.status === "finished";

  async function handleFinish() {
    setIsMenuOpen(false);
    if (await finish()) {
      router.replace(ROUTES.chat);
    }
  }

  function handleReopen() {
    setIsMenuOpen(false);
    void reopen();
  }

  return (
    <View className="relative h-14 flex-row items-center justify-between gap-2 px-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to chat"
        onPress={() => router.replace(ROUTES.chat)}
        className={({ pressed }) =>
          cn(
            "size-10 shrink-0 items-center justify-center rounded-full",
            pressed && "bg-surface-container-low",
          )
        }
      >
        <ChevronLeft size={20} strokeWidth={2} color={ON_SURFACE_VARIANT} />
      </Pressable>

      <View className="min-w-0 flex-1 flex-row items-center justify-center gap-2">
        <View className="size-6 shrink-0 items-center justify-center rounded-md bg-surface-container-high">
          <TypeIcon size={14} strokeWidth={1.75} color={ON_SURFACE_VARIANT} />
        </View>
        <Typography
          variant="body-md"
          numberOfLines={1}
          className="shrink font-semibold text-on-surface"
        >
          {task.title}
        </Typography>
        {isFinished && (
          <Text className="shrink-0 rounded-full bg-surface-container-high px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            finished
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="More"
        onPress={() => setIsMenuOpen((open) => !open)}
        className={({ pressed }) =>
          cn(
            "size-10 shrink-0 items-center justify-center rounded-full",
            pressed && "bg-surface-container-low",
          )
        }
      >
        <MoreHorizontal size={20} strokeWidth={2} color={ON_SURFACE_VARIANT} />
      </Pressable>

      {isMenuOpen && (
        <View className="absolute right-2 top-12 z-10 w-44 flex-col rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
          {isFinished ? (
            <Pressable
              onPress={handleReopen}
              disabled={isMutating}
              className={cn(
                "flex-row items-center gap-2 rounded-lg px-3 py-2",
                isMutating && "opacity-60",
              )}
            >
              <RotateCcw size={16} strokeWidth={2} color={ON_SURFACE} />
              <Text className="text-body-md text-on-surface">Reopen task</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleFinish}
              disabled={isMutating}
              className={cn(
                "flex-row items-center gap-2 rounded-lg px-3 py-2",
                isMutating && "opacity-60",
              )}
            >
              <CheckCircle2 size={16} strokeWidth={2} color={ON_SURFACE} />
              <Text className="text-body-md text-on-surface">Finish task</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export const WorkspaceTopBar = memo(WorkspaceTopBarComponent);
```

Notes / rationale:
- `truncate` (web) → `numberOfLines={1}` + the title parent (`min-w-0 flex-1`) keeps `flex-1`; the `Typography` gets `shrink` so it yields width to the badge/marker. Web's `min-w-0` is a no-op in RN but harmless if kept on the parent (kept as `min-w-0 flex-1`).
- Lifecycle logic is **byte-identical** to web except the two `navigate(ROUTES.chat)`→`router.replace(ROUTES.chat)` swaps. The deliberate asymmetry (finish navigates away on success, reopen stays in place) is preserved by copying `handleFinish`/`handleReopen` intact (the asymmetry lives in plan-20's store; this component just calls `finish()`/`reopen()` and branches on `finish()`'s boolean).
- Menu rows: web `text-body-md` is a font-size class; on the wrapping `Pressable` it would not reach the `Text` child (RN), so it moves onto the `Text`. The icon color (`ON_SURFACE`) replaces web's inherited `text-on-surface` `currentColor`.
- `hover:bg-surface-container-low` (back/more) → pressed bg; `hover:bg-surface-container-low` on menu rows dropped (touch has no hover; pressed feedback optional and out of scope — kept minimal to match web's non-load-bearing hover).
- Tap-outside-to-close is **not** in the web source (web menu stays open until an action or re-tap) — do NOT add a backdrop `Pressable`; preserve web behavior 1:1 (re-tap the More button toggles it closed).

## Step 2 — `workspace-top-banner.tsx`

Environmental-alert banner. Same precedence as web: **offline → voice error → mic denied → render nothing**. Build on the shared `ChatBanner` namespace; `lucide-react`→`lucide-react-native`; `onClick`→`onPress`. **Mic-denied copy changed from "browser settings" → "device settings"** (the only copy change, per brief step 3 — identical to plan 14's chat-top-banner change).

```tsx
import { AlertCircle, TriangleAlert, WifiOff } from "lucide-react-native";
import { memo } from "react";
import { View } from "react-native";
import { ChatBanner } from "@/layout/components/chat-banner";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";

function WorkspaceTopBannerComponent() {
  const isOffline = useConnectivityStore((store) => store.isOffline);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const micPermission = useVoiceStore((store) => store.micPermission);
  const retryVoice = useVoiceStore((store) => store.retryVoice);
  const dismissError = useVoiceStore((store) => store.dismissError);

  const isVoiceError = voiceStatus === "error";
  const isMicDenied = micPermission === "denied";

  if (!isOffline && !isVoiceError && !isMicDenied) {
    return null;
  }

  return (
    <View className="px-4 pb-2">
      {isOffline ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={WifiOff} />
          <ChatBanner.Text>
            You're offline. Sending is paused until you're back online.
          </ChatBanner.Text>
        </ChatBanner.Root>
      ) : isVoiceError ? (
        <ChatBanner.Root tone="error">
          <ChatBanner.Icon icon={AlertCircle} />
          <ChatBanner.Text>mic glitched — try again or type it</ChatBanner.Text>
          <ChatBanner.Action label="Retry" onPress={retryVoice} />
          <ChatBanner.Dismiss onPress={dismissError} />
        </ChatBanner.Root>
      ) : isMicDenied ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={TriangleAlert} />
          <ChatBanner.Text>
            Ben can't hear you yet — turn on mic in device settings.
          </ChatBanner.Text>
          <ChatBanner.Dismiss />
        </ChatBanner.Root>
      ) : null}
    </View>
  );
}

export const WorkspaceTopBanner = memo(WorkspaceTopBannerComponent);
```

Notes / rationale:
- Selectors, the three conditions, precedence, and tone mapping (offline→`warn`, voice error→`error`, mic denied→`warn`) copied verbatim from web. No browser APIs — stores are platform-agnostic (plans 07/17).
- `lucide-react`→`lucide-react-native` for `WifiOff`, `AlertCircle`, `TriangleAlert` (their props already match the `ChatBanner.Icon` `{ icon }` lucide-native signature from plan 11).
- `onClick`→`onPress` on `ChatBanner.Action` (Retry → `retryVoice`) and `ChatBanner.Dismiss` (→ `dismissError`). The mic-denied `Dismiss` has no handler (defaults inside `ChatBanner.Dismiss`), preserved.
- Copy change: `"…browser settings."` → `"…device settings."`. All other copy byte-identical. Wrapper `px-4 pb-2` and `memo` kept.
- This file is **near-identical to plan 14's `chat-top-banner.tsx`** (same banner, different page). They are separately owned (different plans, different folders) and must not be merged or cross-imported — keep both as independent copies per the parallel-safe boundary.

## Step 3 — `workspace-sub-thread-banner.tsx`

State selector that returns one `SubThreadBanner` (Step 4) or `null`, preserving the web priority order: **pendingDiff → suppress; transcribing → `user-pending`; voice error → `error`(retry voice); awaiting reply → `ben-typing`; sendError → `error`(re-send draft); lastBenReply → `ben-reply`; else null.** Pure logic, no DOM — copy intact except the `lucide`/JSX has none here. Jotai `useAtomValue(taskDraftAtom)` is platform-agnostic — kept.

```tsx
import { useAtomValue } from "jotai";
import { memo } from "react";
import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { taskDraftAtom } from "@/pages/task-workspace/states/task-workspace-state";
import { useTaskChatStore } from "@/pages/task-workspace/stores/task-chat-store";
import { SubThreadBanner } from "./sub-thread-banner/sub-thread-banner";

function WorkspaceSubThreadBannerComponent() {
  const task = useWorkspaceTask();
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const retryVoice = useVoiceStore((store) => store.retryVoice);
  const isAwaitingReply = useTaskChatStore((store) => store.isAwaitingReply);
  const sendError = useTaskChatStore((store) => store.sendError);
  const lastBenReply = useTaskChatStore((store) => store.lastBenReply);
  const sendText = useTaskChatStore((store) => store.sendText);
  const draft = useAtomValue(taskDraftAtom);

  if (task?.pendingDiff) {
    return null;
  }

  if (voiceStatus === "transcribing") {
    return <SubThreadBanner variant="user-pending" />;
  }
  if (voiceStatus === "error") {
    return (
      <SubThreadBanner
        variant="error"
        text="couldn't catch that — tap to retry or type it instead"
        onRetry={retryVoice}
      />
    );
  }
  if (isAwaitingReply) {
    return <SubThreadBanner variant="ben-typing" />;
  }
  if (sendError) {
    return (
      <SubThreadBanner
        variant="error"
        text="Ben didn't reply — tap to retry"
        onRetry={() => void sendText(draft)}
      />
    );
  }
  if (lastBenReply) {
    return <SubThreadBanner text={lastBenReply} />;
  }
  return null;
}

export const WorkspaceSubThreadBanner = memo(WorkspaceSubThreadBannerComponent);
```

Notes / rationale:
- Logic **byte-identical** to web. Only the import-ordering is normalized (web had `jotai`/`memo` later); imports must still resolve identically. `useAtomValue`, `selectVoiceStatus`, the store hooks, the draft atom, and the retry closures are all platform-agnostic.
- The two `error` cases pass their distinct `text` + `onRetry` (re-run voice vs. re-send the current draft) exactly as web; `onRetry={() => void sendText(draft)}` keeps the `void` discard.
- `memo` kept.

## Step 4 — `sub-thread-banner/sub-thread-banner.tsx`

Presentational banner, four variants (`ben-reply` default, `user-pending`, `ben-typing`, `error`). Speaker label ("You" for `user-pending`, else "Ben"), single-line truncated body, error-only retry affordance. Animated dots reuse plan-12's `BouncingDots`.

### Web→RN decisions
- Outer `<div>` → `View`; keep the `cn()` error/neutral class branch verbatim (`border-text-error/30 bg-surface-error` vs `border-outline-variant/40 bg-surface-container-lowest`); add `flex-row` (web `flex … items-center` is row-default; RN needs explicit `flex-row`).
- Speaker label `<span>` → `Text` keeping the `font-mono text-[10px] uppercase tracking-wider` + the error/neutral bg/text branch verbatim.
- `ben-typing` dots: three `animate-bounce` spans → `<BouncingDots size={6} />` (web `size-1.5` ≈ 6px; plan-12 default). The container `<span className="inline-flex items-center gap-1">` collapses into the `BouncingDots` row (it already renders `flex-row items-center gap-1`).
- `user-pending`: "Hearing you" `Typography variant="label-caps"` kept; the trailing dots → `<BouncingDots size={6} />`. The wrapping `<span className="inline-flex items-center gap-1.5">` → `View className="flex-row items-center gap-1.5"`.
- Default/error text body: `<Typography variant="body-md" className="truncate text-[14px] …">` → keep classes minus `truncate`, add `numberOfLines={1}`; keep the `isError ? text-text-error : text-on-surface` branch.
- Error retry: `<button>` → `Pressable` wrapping a `Text` (Pressable can't carry a bare string + icon); `onClick`→`onPress`; the `RotateCw` icon → `color={TEXT_ERROR}` `size={12}` (web `size-3`); keep `text-label-caps font-mono uppercase text-text-error` on the `Text`. `onRetry` optional, fired on press.
- `min-w-0 flex-1` body wrapper → `flex-1` (`min-w-0` no-op in RN; keep `flex-1` for grow).
- `memo` kept.

```tsx
import { RotateCw } from "lucide-react-native";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { BouncingDots } from "@/pages/chat/components/bouncing-dots";

const TEXT_ERROR = "#c53030";

type SubThreadBannerProps = {
  variant?: "ben-reply" | "user-pending" | "ben-typing" | "error";
  text?: string;
  onRetry?: () => void;
};

function SubThreadBannerComponent({
  variant = "ben-reply",
  text,
  onRetry,
}: SubThreadBannerProps) {
  const isError = variant === "error";

  return (
    <View
      className={cn(
        "w-full flex-row items-center gap-2.5 rounded-2xl border px-3 py-2",
        isError
          ? "border-text-error/30 bg-surface-error"
          : "border-outline-variant/40 bg-surface-container-lowest",
      )}
    >
      <Text
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
          isError
            ? "bg-text-error/10 text-text-error"
            : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        {variant === "user-pending" ? "You" : "Ben"}
      </Text>
      <View className="flex-1">
        {variant === "ben-typing" ? (
          <BouncingDots size={6} />
        ) : variant === "user-pending" ? (
          <View className="flex-row items-center gap-1.5">
            <Typography variant="label-caps" className="text-on-surface-variant">
              Hearing you
            </Typography>
            <BouncingDots size={6} />
          </View>
        ) : (
          <Typography
            variant="body-md"
            numberOfLines={1}
            className={cn(
              "text-[14px]",
              isError ? "text-text-error" : "text-on-surface",
            )}
          >
            {text}
          </Typography>
        )}
      </View>
      {isError && (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="shrink-0 flex-row items-center gap-1"
        >
          <RotateCw size={12} color={TEXT_ERROR} />
          <Text className="text-label-caps font-mono uppercase text-text-error">
            retry
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export const SubThreadBanner = memo(SubThreadBannerComponent);
```

Notes / rationale:
- The four-variant prop shape, default `"ben-reply"`, and `isError` derivation are copied verbatim.
- **`BouncingDots` reuse** (plan 12) is the single most important port decision here: web's two `animate-bounce` clusters (the `ben-typing` dots and the `user-pending` trailing dots) both become `<BouncingDots size={6} />` — Reanimated, no CSS keyframes (matches the simple-plan's "recreate the animated indicators using the mobile animation approach" and avoids reimplementing the bounce). The plan-12 dots are `bg-on-surface-variant`, matching web's `bg-on-surface-variant` exactly. The dot count (3) and stagger are identical.
- `truncate` → `numberOfLines={1}` on the body `Typography`; the `text-[14px]` arbitrary size and the error/neutral color branch kept.
- Error retry: web `inline-flex … gap-1 text-label-caps font-mono uppercase text-text-error` → the classes split between the `Pressable` (layout: `flex-row items-center gap-1`) and the `Text` (typography: `text-label-caps font-mono uppercase text-text-error`); the lucide `RotateCw size-3` → `size={12}` `color={TEXT_ERROR}`.
- The `user-pending` "Hearing you" label uses the `label-caps` Typography variant (exists in plan 05) — kept; only the dots become `BouncingDots`.

---

## Files created (exhaustive — nothing outside the four owned locations)

```
project-mobile/src/pages/task-workspace/components/
├── workspace-top-bar/
│   └── workspace-top-bar.tsx              (Step 1)
├── workspace-top-banner.tsx               (Step 2)
├── workspace-sub-thread-banner.tsx        (Step 3)
└── sub-thread-banner/
    └── sub-thread-banner.tsx              (Step 4)
```

No `index.ts`/barrel files (memory: no export-only files). One component per file (memory; `WorkspaceTopBar`/`WorkspaceTopBanner`/`WorkspaceSubThreadBanner`/`SubThreadBanner` each in its own file). All file/folder names kebab-case; exported identifiers PascalCase. Folder layout mirrors web 1:1.

## Conventions honored

- **kebab-case** files/folders; PascalCase components (page-structure design).
- **Destructured props, function declarations, no default exports, no comments** (code-write-code skill).
- **Shared primitives/stores/animation reused, never reduplicated** — `Typography`, `ChatBanner`, `useWorkspaceTask`, `useTaskLifecycleStore`/`useTaskChatStore`, `taskDraftAtom`, `useConnectivityStore`, `useVoiceStore`/`selectVoiceStatus`, `BouncingDots`, `ROUTES`, `router` all imported from their owning plans.
- **NativeWind class parity** with web wherever an RN equivalent exists; `hover:`/`transition-*`/`truncate` dropped (pressed feedback via `pressed`; truncation via `numberOfLines={1}`); icons via `lucide-react-native` `size`/`color` (component-variant / RN mapping consistent with plans 05/11/14).
- **`memo`** retained on the three components that web memoized.

## Things explicitly NOT done in this unit

- **No page assembly / layout composition** — these four pieces are leaf shell components; plan 27 mounts them inside `app/tasks/[taskId]` and wires `setTaskId`/`reset`.
- **No edits to** `@/layout/components/ui/*`, `chat-banner`, the voice/connectivity stores, the task-workspace stores/hooks/atoms (plan 20), `bouncing-dots` (plan 12), or `@/core/routes`/`expo-router` — all consumed via public interfaces.
- **No tap-outside backdrop** added to the top-bar menu (web has none — preserve behavior).
- **No merge with plan 14's `chat-top-banner.tsx`** despite near-identical content (separate ownership / parallel-safe).
- **No formatting/lint step** (per task). Verification is type-check only.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with no errors. If `tsc` fails on imports of `@/pages/task-workspace/{hooks,stores,states}/*` (plan 20), `@/layout/components/chat-banner` (plan 11), `@/layout/components/ui/typography` (plan 05), `@/layout/stores/{voice,connectivity}-store` (plan 07/17), `@/pages/chat/components/bouncing-dots` (plan 12), `@/core/routes`/`expo-router` (plan 01), or `lucide-react-native` (plan 01), the failure is an upstream dependency gap, not this unit — touch only the single failing import line.

Behavioral self-check (read-only reasoning, no runtime in this unit):
1. `WorkspaceTopBar` renders `null` with no task; otherwise shows back control, content-type badge (`List`/`Type`), truncated title, `finished` marker when finished, and a More trigger that toggles the Finish/Reopen menu; Finish navigates back to chat on success, Reopen stays; both disabled while `isMutating`.
2. `WorkspaceTopBanner` renders exactly one banner for the first matching condition (offline → voice error → mic denied) and `null` when all clear; mic-denied copy says "device settings".
3. `WorkspaceSubThreadBanner` returns `null` while a diff is pending, else the first matching variant in priority order; the two error variants carry distinct text + retry.
4. `SubThreadBanner` renders the speaker label, the correct variant body (Reanimated `BouncingDots` for typing/listening, single-line text otherwise), and the retry affordance only in the `error` variant.
