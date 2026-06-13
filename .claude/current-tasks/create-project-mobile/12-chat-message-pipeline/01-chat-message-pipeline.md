# Plan 12 — Chat message rendering pipeline (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively (the only files this plan creates/edits):**
> - `project-mobile/src/pages/chat/components/chat-history/`
> - `project-mobile/src/pages/chat/components/message-bubble/`
> - `project-mobile/src/pages/chat/components/message-footers/`
> - `project-mobile/src/pages/chat/components/capture-card/` (+ `contexts/`, `types/`)
> - `project-mobile/src/pages/chat/components/typing-indicator.tsx`
> - `project-mobile/src/pages/chat/hooks/use-chat-list.ts`
> **Parallel-safe:** touches nothing outside the folders above. Runs alongside plans 13/14/15 (distinct chat folders). `use-scroll-to-bottom` belongs to plan 15 — NOT created here.
> **Depends on:** plan 10 (chat backbone: stores, `use-chat-messages`, `getMessageText`, `BenUiMessage`), plan 11 (shared composites — no direct import), plan 05 (UI primitives: `Typography`), plan 08 (data hooks: `useMessageListData`).
> **Verification:** `cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit` (no formatting / no lint step).
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port the `project-web` message-rendering layer to React Native / Expo. Two real rewrites vs. web (per `MOBILE-PORT-ANALYSIS.md`):

1. **Scroll/pagination:** replace the web `IntersectionObserver` + `window.scrollBy` infinite-scroll-up (`use-infinite-scroll-top.ts`) with an **inverted `FlatList`** + `onEndReached`. The inverted list pins the newest message at the bottom and natively preserves the reading position when an older page is prepended — no manual scroll compensation, no scroll-to-bottom hack here.
2. **Animations:** replace CSS `animate-bounce` / `animate-pulse` with **`react-native-reanimated`** (typing-indicator dots, transcribing-footer dots, skeleton pulse). No CSS keyframes exist in RN.

Everything else is a faithful translation: `<div>`→`View`, text→`Text`/`Typography`, `<button>`/`onClick`→`Pressable`/`onPress`, `lucide-react`→`lucide-react-native`, `Link to=`→`router.push` (expo-router), `cn(...)` className strings kept byte-for-byte where an RN equivalent exists. **Plain text only — no markdown** (analysis: "chat … é texto puro → sem react-markdown").

### web → mobile mapping (applies throughout)

| web | mobile |
|---|---|
| `<section>` / `<div>` | `View` (or `FlatList` for the list) |
| bare string / `{text}` child | `<Text>` (RN cannot render a bare string outside `Text`) |
| `<span className="italic …">…</span>` | `<Text className="italic …">…</Text>` |
| `<button onClick>` | `Pressable onPress` |
| `<Link to={ROUTES.taskWorkspace(id)}>` | `router.push(\`/tasks/${id}\`)` via `expo-router` |
| `lucide-react` (`RotateCw`, `X`, `Bell`, `List`, `NotebookPen`, `Type`, `Play`, `ChevronRight`) | `lucide-react-native` (same names) |
| `animate-bounce` / `animate-pulse` | `react-native-reanimated` driver |
| `aria-label` | `accessibilityLabel` |
| `IntersectionObserver` + `window.scrollBy` | inverted `FlatList` + `onEndReached` |

### Hard RN constraints discovered from the web source (do not regress)

- **Bare strings must be wrapped in `Text`.** `chat-history.tsx` renders `{text}` and literal copy (`"couldn't catch that — tap to retry…"`) directly inside the bubble; `message-bubble.tsx` renders `{children}`. On RN a string cannot be a direct child of a `View`. The `MessageBubble` therefore wraps string/number children in a `<Text>` carrying the bubble text classes (same approach plan 05 used for `Button`), and passes element children (the capture card) through untouched.
- **`lucide-react-native` icons take a `color` prop, not `currentColor` via className.** Web colored icons through the parent's `text-*` className. On RN, pass the token color explicitly (or rely on NativeWind SVG cssInterop if plan 01 wired it). Plan keeps the same `text-*` className on the wrapper for layout parity AND passes an explicit `color` to the lucide icon so it paints regardless.
- **`expo-router` navigation, not a wrapping `Link`.** Web wrapped `<CaptureCard.Action />` in a `<Link>`. RN: the `CaptureCardActionButton`'s own `onAction`/`onPress` performs `router.push`. The list passes the navigation callback into `<CaptureCard.Action onAction={…} />` instead of wrapping it.

---

## Prerequisite assumptions (delivered by deps — verify read-only, do NOT create)

From plan 05: `@/layout/components/ui/typography` → `Typography` (`variant`, `className`, `...TextProps` incl. `numberOfLines`).
From plan 03: `@/layout/utils/styles` → `cn()`; `tailwind.config.js` resolves the color tokens used below (`surface-container-low`, `surface-container-lowest`, `surface-container-high`, `on-surface`, `on-surface-variant`, `primary`, `on-primary`, `surface-tint`, `surface-error`, `text-error`, `outline-variant`, `inverse-surface`) and the text-size tokens (`body-md`, `label-caps`).
From plan 08: `@/layout/hooks/api/use-message-list-data` → `useMessageListData()` returning `{ state: { items, hasMore, isLoading, isFetchingNextPage, isError, error }, actions: { fetchNextPage, refetch } }` (cursor-paginated `Message`, newest-first).
From plan 10:
- `@/pages/chat/hooks/use-chat-messages` → `useChatMessages()` → `{ messages: BenUiMessage[] (oldest-first), historyState: { items, hasMore, isLoading, isFetchingNextPage, isEmpty, … }, historyActions: { fetchNextPage, refetch } }`, and `mapHistoryToUiMessages`.
- `@/pages/chat/utils/chat-messages` → `getMessageText(message)`, type `BenUiMessage`.
- `@/pages/chat/stores/messages-store` → `useMessagesStore` (`isAwaitingReply`, `sendError`, `sessionMessages`, `retrySend`).
- `@/layout/stores/voice-store` → `useVoiceStore`, `selectVoiceStatus`, type `VoiceStatus`; actions `retryVoice`, `cancelTranscribing` (status values `"idle" | "recording" | "transcribing" | "error"`).
- `@/api/models/message` → `Message`, `MessageCapture`, `CaptureKind` (`"note" | "reminder" | "task"`).
From plan 01: deps present — `react-native-reanimated`, `react-native-svg`, `lucide-react-native`, `expo-router`, `nativewind`.

If a prerequisite is missing at implementation time, **do not add it here** (breaks parallel-safety) — note it; `tsc` surfaces missing modules. The `messages-store`/`voice-store` selectors are consumed via their public interface unchanged.

---

## Step 1 — Capture card types (`capture-card/types/index.ts`)

Copy the web `types/` content **verbatim**, with one RN change: `CaptureCardIcon` is no longer a web `ComponentType<{ className; strokeWidth }>` — `lucide-react-native` icons accept `{ size?; color?; strokeWidth? }`. Keep `className` optional too (NativeWind cssInterop may consume it).

```ts
import type { ComponentType } from "react";

export type CaptureKind = "note" | "reminder" | "task";
export type TaskShape = "text" | "list";
export type CaptureCardState =
  | "default"
  | "pending"
  | "error"
  | "active"
  | "finished"
  | "fired";

export type CaptureCardIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}>;
```

> The web `CaptureCardProps` aggregate type (`title`, `meta`, `onAction`, …) is **not used by any consumer in this pipeline** (the list composes the parts directly), and the web file only kept it for documentation. Omit it to avoid dead code — re-add only if a later plan imports it. File name: keep the web folder shape `types/` with a single `index.ts` (NOT a barrel re-export; it is a concrete type module).

## Step 2 — Capture card context (`capture-card/contexts/capture-card-context.ts`)

Copy **intact** — pure React context, platform-agnostic. Only the type import path stays `@/pages/chat/components/capture-card/types`.

```ts
import { createContext, useContext } from "react";
import type {
  CaptureCardState,
  CaptureKind,
  TaskShape,
} from "@/pages/chat/components/capture-card/types";

export type CaptureCardContextValue = {
  kind: CaptureKind;
  state: CaptureCardState;
  taskShape: TaskShape;
};

export const CaptureCardContext = createContext<CaptureCardContextValue | null>(
  null,
);

export function useCaptureCard() {
  const context = useContext(CaptureCardContext);

  if (!context) {
    throw new Error("CaptureCard parts must be used within <CaptureCard.Root>");
  }

  return context;
}
```

## Step 3 — Capture card parts (one file each, `capture-card/`)

Translate each web part to RN. The class strings are kept identical wherever an RN equivalent exists; layout-only web utilities that have no RN meaning (`inline-flex`, `self-end`, `pointer-events-none`, hover/transition) are handled as noted.

### `capture-card-root.tsx`
`<div>` → `View`; keep `mt-2 flex items-start gap-3 rounded-xl border …` (RN needs `flex-row` for the horizontal icon+body layout — web's `flex` here was row because `<div>` default; RN default is column, so **add `flex-row`**). Conditional state classes copied verbatim.

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { cn } from "@/layout/utils/styles";
import { CaptureCardContext } from "./contexts/capture-card-context";
import type { CaptureCardState, CaptureKind, TaskShape } from "./types";

type CaptureCardRootProps = {
  kind: CaptureKind;
  state?: CaptureCardState;
  taskShape?: TaskShape;
  children: ReactNode;
  className?: string;
};

export function CaptureCardRoot({
  kind,
  state = "default",
  taskShape = "text",
  children,
  className,
}: CaptureCardRootProps) {
  const isError = state === "error";
  const isPending = state === "pending";
  const isFired = state === "fired";
  const isFinished = state === "finished";

  return (
    <CaptureCardContext.Provider value={{ kind, state, taskShape }}>
      <View
        className={cn(
          "mt-2 flex-row items-start gap-3 rounded-xl border bg-surface-container-lowest px-3.5 py-3",
          isError && "border-text-error/30 bg-surface-error",
          isPending && "border-outline-variant/30 opacity-80",
          isFinished && "border-outline-variant/40 bg-surface-container-low",
          isFired && "border-outline-variant/40 bg-surface-container-low",
          !isError &&
            !isPending &&
            !isFinished &&
            !isFired &&
            "border-outline-variant/50",
          className,
        )}
      >
        {children}
      </View>
    </CaptureCardContext.Provider>
  );
}
```

### `capture-card-icon.tsx`
Icons from `lucide-react-native`. `<span>` → `View`. Pass the resolved token color to the icon explicitly (the `text-*` classes on the wrapper do not propagate to the SVG on RN). Use `cn()` for the wrapper background only; pass `color` + `size` to the lucide icon.

```tsx
import { Bell, List, NotebookPen, Type } from "lucide-react-native";
import { View } from "react-native";
import { cn } from "@/layout/utils/styles";
import { useCaptureCard } from "./contexts/capture-card-context";
import type { CaptureCardIcon, CaptureKind, TaskShape } from "./types";

const KIND_ICON: Record<CaptureKind, CaptureCardIcon> = {
  note: NotebookPen,
  reminder: Bell,
  task: Type,
};

const TASK_SHAPE_ICON: Record<TaskShape, CaptureCardIcon> = {
  text: Type,
  list: List,
};

export function CaptureCardIcon() {
  const { kind, state, taskShape } = useCaptureCard();
  const isError = state === "error";
  const isMuted = state === "fired" || state === "finished";
  const Icon = kind === "task" ? TASK_SHAPE_ICON[taskShape] : KIND_ICON[kind];

  return (
    <View
      className={cn(
        "mt-0.5 size-7 shrink-0 items-center justify-center rounded-lg",
        isError
          ? "bg-surface-error"
          : "bg-surface-container-high",
      )}
    >
      <Icon size={16} strokeWidth={1.75} className={iconColorClass(isError, isMuted)} />
    </View>
  );
}
```

> `iconColorClass` is a tiny module-level helper returning the matching `text-*` class (`text-text-error` / `text-on-surface-variant/60` / `text-on-surface-variant`) so NativeWind SVG cssInterop can paint it; this keeps the icon coloring declarative. If plan 01 did NOT wire SVG cssInterop, replace `className=` with `color={resolvedHexFromToken}` — but prefer the className route to stay token-driven and avoid hardcoding hex. `size-4`→`size={16}`; `size-7` stays a className on the wrapper `View`.

### `capture-card-body.tsx`
`<div>` → `View`; classes copied (`flex min-w-0 flex-1 flex-col gap-0.5` → `min-w-0 flex-1 flex-col gap-0.5`; RN `View` is already column so `flex-col` is harmless/kept for parity, drop `flex`).

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";

type CaptureCardBodyProps = {
  children: ReactNode;
};

export function CaptureCardBody({ children }: CaptureCardBodyProps) {
  return <View className="min-w-0 flex-1 flex-col gap-0.5">{children}</View>;
}
```

### `capture-card-header.tsx`
`<div>` → `View` (`flex-row`); inner `<Typography>` and the `fired`/`active` badge `<span>`s → `Typography` / `Text`. Classes copied verbatim.

```tsx
import { View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { useCaptureCard } from "./contexts/capture-card-context";
import type { CaptureKind } from "./types";

const KIND_LABEL: Record<CaptureKind, string> = {
  note: "Note",
  reminder: "Reminder",
  task: "Task",
};

export function CaptureCardHeader() {
  const { kind, state } = useCaptureCard();
  const isError = state === "error";
  const isFired = state === "fired";
  const isActive = state === "active";

  return (
    <View className="flex-row items-center gap-1.5">
      <Typography
        variant="label-caps"
        className={isError ? "text-text-error" : "text-on-surface-variant"}
      >
        {KIND_LABEL[kind]}
      </Typography>
      {isFired && (
        <Typography
          variant="label-caps"
          className="text-[10px] tracking-wider text-on-surface-variant/60"
        >
          · fired
        </Typography>
      )}
      {isActive && (
        <Typography
          variant="label-caps"
          className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] tracking-wider text-primary"
        >
          active
        </Typography>
      )}
    </View>
  );
}
```

> Web used raw `font-mono text-[10px] uppercase` spans; `Typography variant="label-caps"` already carries `font-mono uppercase` (plan 05), so reuse it and override size with `text-[10px]`. This keeps the component-variant pattern and avoids a raw styled `Text`.

### `capture-card-title.tsx`, `capture-card-meta.tsx`, `capture-card-supporting-text.tsx`
All three are pure `Typography` wrappers reading `state` from context; copy **intact** (no DOM, no element). `line-through` (title finished) is a valid RN text style via NativeWind. `meta`/`supporting-text` keep their `if (state === "error") return null;` early returns verbatim.

```tsx
// capture-card-title.tsx
import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useCaptureCard } from "./contexts/capture-card-context";

type CaptureCardTitleProps = { children: ReactNode };

export function CaptureCardTitle({ children }: CaptureCardTitleProps) {
  const { state } = useCaptureCard();
  const isError = state === "error";
  const isFinished = state === "finished";
  const isFired = state === "fired";

  return (
    <Typography
      variant="body-md"
      className={cn(
        "leading-snug",
        isError && "text-text-error",
        isFinished && "text-on-surface-variant line-through",
        isFired && "text-on-surface-variant",
        !isError && !isFinished && !isFired && "text-on-surface",
      )}
    >
      {children}
    </Typography>
  );
}
```

(`meta` and `supporting-text` are the web files verbatim with `Typography` from the mobile path — identical bodies, only the import path differs.)

### `capture-card-action-button.tsx`
`<button>` → `Pressable`; `onClick`→`onPress`; `disabled` stays; icons from `lucide-react-native`; the label is wrapped in `<Text>` (bare string can't sit in `Pressable`). `self-end`/`transition-colors`/`hover:` dropped (no hover on touch); `pointer-events-none` → `disabled` already blocks press. Keep the `DEFAULT_TASK_ACTION_LABEL` map and the kind/state guard verbatim.

```tsx
import { ChevronRight, Play } from "lucide-react-native";
import { Pressable, Text } from "react-native";
import { cn } from "@/layout/utils/styles";
import { useCaptureCard } from "./contexts/capture-card-context";
import type { CaptureCardState } from "./types";

const DEFAULT_TASK_ACTION_LABEL: Record<CaptureCardState, string> = {
  default: "Start",
  pending: "Start",
  active: "Continue",
  finished: "View",
  error: "Start",
  fired: "Start",
};

type CaptureCardActionButtonProps = {
  actionLabel?: string;
  onAction?: () => void;
};

export function CaptureCardActionButton({
  actionLabel,
  onAction,
}: CaptureCardActionButtonProps) {
  const { kind, state } = useCaptureCard();

  if (kind !== "task" || state === "error") {
    return null;
  }

  const isPending = state === "pending";
  const isActive = state === "active";
  const isFinished = state === "finished";
  const resolvedActionLabel = actionLabel ?? DEFAULT_TASK_ACTION_LABEL[state];
  const labelColor = isFinished ? "text-on-surface-variant" : "text-on-primary";

  return (
    <Pressable
      onPress={onAction}
      disabled={isPending}
      className={cn(
        "mt-2 flex-row shrink-0 items-center gap-1 self-end rounded-full px-3 py-1.5",
        isFinished ? "bg-transparent" : "bg-primary",
        isPending && "opacity-60",
      )}
    >
      {!isFinished && !isActive && (
        <Play size={12} strokeWidth={2.5} className={labelColor} />
      )}
      <Text
        className={cn(
          "text-label-caps font-mono font-semibold uppercase tracking-wider",
          labelColor,
        )}
      >
        {resolvedActionLabel}
      </Text>
      {isFinished && <ChevronRight size={14} className={labelColor} />}
    </Pressable>
  );
}
```

> `self-end` is preserved (valid RN flex). Icon color forwarded via `className` (cssInterop) as in Step 3 icon note.

### `capture-card-error-button.tsx`
`<button>` → `Pressable`; label string → `<Text>`; `RotateCw` from `lucide-react-native`. `DEFAULT_ERROR_MESSAGES` map kept verbatim. (Not rendered in this pipeline's happy path — the list passes `default` state — but ported for completeness/parity since plan owns the folder.)

```tsx
import { RotateCw } from "lucide-react-native";
import { Pressable, Text } from "react-native";
import { useCaptureCard } from "./contexts/capture-card-context";
import type { CaptureKind } from "./types";

const DEFAULT_ERROR_MESSAGES: Record<CaptureKind, string> = {
  note: "couldn't save this note — retry",
  reminder: "couldn't save this reminder — retry",
  task: "couldn't set this up — retry",
};

type CaptureCardErrorButtonProps = {
  errorMessage?: string;
  onAction?: () => void;
};

export function CaptureCardErrorButton({
  errorMessage,
  onAction,
}: CaptureCardErrorButtonProps) {
  const { kind, state } = useCaptureCard();

  if (state !== "error") {
    return null;
  }

  return (
    <Pressable
      onPress={onAction}
      className="mt-1 flex-row items-center gap-1.5 self-start"
    >
      <RotateCw size={14} className="text-text-error" />
      <Text className="text-label-caps font-mono uppercase text-text-error">
        {errorMessage ?? DEFAULT_ERROR_MESSAGES[kind]}
      </Text>
    </Pressable>
  );
}
```

### `capture-card/index.tsx`
The `CaptureCard` object map is the **public compound API** the chat-history consumes (`CaptureCard.Root`, `.Icon`, …). It is a value object, not a pure re-export barrel, so it is allowed under the no-barrel rule (same call as web). Copy intact (paths unchanged).

```tsx
import { CaptureCardActionButton } from "./capture-card-action-button";
import { CaptureCardBody } from "./capture-card-body";
import { CaptureCardErrorButton } from "./capture-card-error-button";
import { CaptureCardHeader } from "./capture-card-header";
import { CaptureCardIcon } from "./capture-card-icon";
import { CaptureCardMeta } from "./capture-card-meta";
import { CaptureCardRoot } from "./capture-card-root";
import { CaptureCardSupportingText } from "./capture-card-supporting-text";
import { CaptureCardTitle } from "./capture-card-title";

export const CaptureCard = {
  Root: CaptureCardRoot,
  Icon: CaptureCardIcon,
  Body: CaptureCardBody,
  Header: CaptureCardHeader,
  Title: CaptureCardTitle,
  Meta: CaptureCardMeta,
  SupportingText: CaptureCardSupportingText,
  Action: CaptureCardActionButton,
  Error: CaptureCardErrorButton,
};
```

## Step 4 — Message bubble (`message-bubble/message-bubble.tsx`)

`<div>`s → `View`s; classes kept (add `flex-row`/`flex-col` where the web relied on `<div>` defaults). State map (`default`/`pending`/`error`/`skeleton`) preserved. **String children wrapped in `Text`** (the load-bearing RN change). The skeleton variant uses the Reanimated pulse from Step 7 (`PulseView`) instead of `animate-pulse`.

```tsx
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import { Text, View } from "react-native";
import { cn } from "@/layout/utils/styles";
import { PulseView } from "@/pages/chat/components/typing-indicator";

type MessageBubbleProps = {
  from: "user" | "ben";
  state?: "default" | "pending" | "error" | "skeleton";
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

function renderTextChild(child: ReactNode, index: number, textClass: string) {
  if (typeof child === "string" || typeof child === "number") {
    return (
      <Text key={index} className={textClass}>
        {child}
      </Text>
    );
  }
  return child;
}

export function MessageBubble({
  from,
  state = "default",
  children,
  footer,
  className,
}: MessageBubbleProps) {
  const isBen = from === "ben";
  const textClass = cn(
    "text-body-md",
    isBen ? "text-on-surface" : "text-on-primary",
    state === "error" && "text-text-error",
  );

  if (state === "skeleton") {
    return (
      <View className={cn("w-full", isBen ? "items-start" : "items-end", className)}>
        <PulseView className="h-9 w-40 rounded-2xl rounded-tl-sm bg-outline-variant" />
      </View>
    );
  }

  return (
    <View
      className={cn(
        "w-full flex-row",
        isBen ? "justify-start" : "justify-end",
        className,
      )}
    >
      <View className={cn("max-w-[78%] flex-col gap-1", isBen ? "items-start" : "items-end")}>
        <View
          className={cn(
            "rounded-2xl px-4 py-3",
            isBen
              ? "rounded-tl-sm bg-surface-container-low"
              : "rounded-tr-sm bg-primary",
            state === "pending" && "opacity-60",
            state === "error" && "border border-text-error/30 bg-surface-error",
          )}
        >
          {Children.map(children, (child, index) =>
            renderTextChild(child, index, textClass),
          )}
        </View>
        {footer}
      </View>
    </View>
  );
}
```

Notes:
- Web set `text-body-md` + color on the bubble `<div>` so the bare-string children inherited it. RN does not inherit text styles across `View`, so the color/size classes move onto the wrapping `<Text>` (`textClass`) produced by `renderTextChild`. Element children (the `CaptureCard`) pass through untouched (`isValidElement` not strictly needed since non-string returns as-is, but `Children.map` normalizes keys).
- `state === "error"` text color is folded into `textClass` (web applied it on the bubble container; same visual result).
- Skeleton: web rendered a fixed-size `animate-pulse` block; here it is a `PulseView` (Reanimated opacity loop) with the same `h-9 w-40 … bg-outline-variant` classes. The non-skeleton early-return keeps the bubble container out of the skeleton path entirely (web hid children with `state !== "skeleton" && children`; the RN early-return is cleaner and avoids an empty bordered box).

## Step 5 — Message footers (`message-footers/`)

Three files. `<button>`→`Pressable`, `onClick`→`onPress`, label→`Text`/`Typography`, icons→`lucide-react-native`. The transcribing dots use the Reanimated `BouncingDots` from Step 7.

### `send-retry-footer.tsx`
```tsx
import { RotateCw } from "lucide-react-native";
import { Pressable } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useMessagesStore } from "@/pages/chat/stores/messages-store";

type SendRetryFooterProps = { className?: string };

export function SendRetryFooter({ className }: SendRetryFooterProps) {
  const retrySend = useMessagesStore((store) => store.retrySend);

  return (
    <Pressable
      onPress={() => void retrySend()}
      className={cn("mt-1 flex-row items-center gap-1.5 pr-2", className)}
    >
      <RotateCw size={14} className="text-text-error" />
      <Typography variant="label-caps" className="text-text-error">
        Ben didn't reply — tap to retry
      </Typography>
    </Pressable>
  );
}
```

### `retry-footer.tsx`
Identical shape, `useVoiceStore((s) => s.retryVoice)`, label `"Tap to retry"`. `text-text-error` moved onto icon + `Typography` (web put it on the `<button>`; RN needs it per leaf).

### `transcribing-footer.tsx`
`<div>` → `View`; cancel `<button>` → `Pressable` (`X` icon, `accessibilityLabel="Cancel transcription"`); the three `animate-bounce` dot `<span>`s → `<BouncingDots size={4} />` (Step 7). `cancelTranscribing` from `useVoiceStore`.

```tsx
import { X } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useVoiceStore } from "@/layout/stores/voice-store";
import { BouncingDots } from "@/pages/chat/components/typing-indicator";

type TranscribingFooterProps = { className?: string };

export function TranscribingFooter({ className }: TranscribingFooterProps) {
  const cancelTranscribing = useVoiceStore((store) => store.cancelTranscribing);

  return (
    <View className={cn("flex-row items-center gap-1.5 pr-2", className)}>
      <Typography variant="label-caps" className="text-on-surface-variant">
        Hearing you
      </Typography>
      <BouncingDots size={4} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel transcription"
        onPress={cancelTranscribing}
        className="ml-1 size-4 items-center justify-center rounded-full"
      >
        <X size={12} className="text-on-surface-variant" />
      </Pressable>
    </View>
  );
}
```

> `hover:text-text-error` dropped (no hover). `size-3`/`size-3.5` → numeric `size` on lucide; `size-1`/`size-1.5` dot sizing handled by `BouncingDots` `size` prop (px). Icon colors via className per Step 3.

## Step 6 — Typing indicator + animation primitives (`typing-indicator.tsx`)

This single file exports three things consumed across the pipeline: `TypingIndicator` (the Ben-is-typing bubble), `BouncingDots` (reusable dot row — also used by the transcribing footer), and `PulseView` (reusable opacity-pulse wrapper — used by the bubble skeleton and the history skeleton). Replaces CSS `animate-bounce` (staggered, `[animation-delay:-0.2s]`/`-0.1s`/`0`) and `animate-pulse` with `react-native-reanimated`.

> Per the one-component-per-file memory rule, prefer keeping each in its own file. But the web kept `typing-indicator.tsx` as the single owned file and the plan scope lists exactly `typing-indicator.tsx`. To honor the scope **and** the rule, split into:
> - `typing-indicator.tsx` → `TypingIndicator` (the named component the plan scope requires)
> - `typing-indicator/` is NOT created; instead the shared animation helpers live in sibling files this plan also owns: `message-footers`/`message-bubble` import from small dedicated files. **Decision:** create `bouncing-dots.tsx` and `pulse-view.tsx` alongside `typing-indicator.tsx` under `chat-history/`'s parent `components/` (the plan owns `components/` chat subfolders). Final layout below puts `bouncing-dots.tsx` and `pulse-view.tsx` next to `typing-indicator.tsx` at `components/`. Each file = one component (rule satisfied). Update the imports in Steps 4/5 accordingly (`@/pages/chat/components/bouncing-dots`, `@/pages/chat/components/pulse-view`).

`bouncing-dots.tsx`:
```tsx
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/layout/utils/styles";

const DELAYS = [0, 100, 200];

type BouncingDotsProps = {
  size?: number;
  className?: string;
};

function Dot({ delay, size }: { delay: number; size: number }) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-3, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
      ),
    );
  }, [delay, offset]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      className="bg-on-surface-variant"
    />
  );
}

export function BouncingDots({ size = 6, className }: BouncingDotsProps) {
  return (
    <View className={cn("flex-row items-center gap-1", className)}>
      {DELAYS.map((delay) => (
        <Dot key={delay} delay={delay} size={size} />
      ))}
    </View>
  );
}
```

> Web staggered with negative `animation-delay` (`-0.2s`, `-0.1s`, `0`) so the FIRST dot leads. Reanimated has no negative delay, so use positive ascending delays (`0`, `100`, `200`) — same visual cascade, leading edge on dot 1. `size-1.5` (typing) ≈ `6px` default; `size-1` (transcribing) → `size={4}`. The bounce `translateY -3` ≈ tailwind `animate-bounce` amplitude, tuned for the small dots.

`pulse-view.tsx`:
```tsx
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { ReactNode } from "react";

type PulseViewProps = {
  className?: string;
  children?: ReactNode;
};

export function PulseView({ className, children }: PulseViewProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View className={className} style={style}>
      {children}
    </Animated.View>
  );
}
```

> Reproduces tailwind `animate-pulse` (opacity 0.5↔1 loop). `reverse=true` (3rd arg) ping-pongs.

`typing-indicator.tsx`:
```tsx
import { View } from "react-native";
import { cn } from "@/layout/utils/styles";
import { BouncingDots } from "@/pages/chat/components/bouncing-dots";

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <View
      accessibilityLabel="Ben is typing"
      className={cn(
        "flex-row items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-container-low px-4 py-3.5",
        className,
      )}
    >
      <BouncingDots size={6} />
    </View>
  );
}
```

> `inline-flex`→`flex-row` (RN). `aria-label`→`accessibilityLabel`. Dot color/size/gap match web (`bg-on-surface-variant`, `size-1.5`, `gap-1`).

## Step 7 — List/pagination hook (`hooks/use-chat-list.ts`)

The FlatList replacement for `use-infinite-scroll-top.ts`. It is **list-data only** — it does NOT do scroll-to-bottom (plan 15). It composes `useChatMessages` (plan 10), reverses the visual order for the inverted list, and guards against duplicate older-page fetches.

Key design decisions:
- `useChatMessages()` already returns `messages` **oldest-first** (history reversed + session appended). An **inverted** `FlatList` renders `data[0]` at the visual bottom, so the list `data` must be **newest-first** → reverse `messages` once here. `onEndReached` (which in an inverted list fires at the visual top) triggers `historyActions.fetchNextPage`.
- Duplicate-fetch guard: `FlatList` can fire `onEndReached` repeatedly. Gate `loadOlder` on `historyState.hasMore && !historyState.isFetchingNextPage` (the React Query hook already de-dupes in-flight pages, but the explicit guard prevents spurious calls before state updates).
- Expose exactly what the `ChatHistory` FlatList needs: the ordered `data`, `loadOlder`, `isFetchingOlder`, `hasMore`, `isLoading` (initial skeleton), `isEmpty`.

```ts
import { useCallback, useMemo } from "react";
import { useChatMessages } from "@/pages/chat/hooks/use-chat-messages";
import type { BenUiMessage } from "@/pages/chat/utils/chat-messages";

export function useChatList() {
  const { messages, historyState, historyActions } = useChatMessages();

  const data = useMemo<BenUiMessage[]>(
    () => [...messages].reverse(),
    [messages],
  );

  const loadOlder = useCallback(() => {
    if (historyState.hasMore && !historyState.isFetchingNextPage) {
      historyActions.fetchNextPage();
    }
  }, [historyState.hasMore, historyState.isFetchingNextPage, historyActions]);

  return {
    data,
    loadOlder,
    isFetchingOlder: historyState.isFetchingNextPage,
    hasMore: historyState.hasMore,
    isLoading: historyState.isLoading,
    isEmpty: historyState.isEmpty,
  };
}
```

> Rationale for reversing in the hook (not in `useChatMessages`): plan 10 owns `use-chat-messages.ts` and must stay byte-identical to web (oldest-first, also consumed by non-inverted contexts). The inversion concern is purely a list-presentation detail, so it lives in this list hook. (`[...messages].reverse()` is memoized; cost is negligible vs. virtualization.)

## Step 8 — Chat history (`chat-history/chat-history.tsx`)

The inverted `FlatList`. Replaces the web `<section>` + `topRef`/`bottomRef` + `.map()`. The session-state extras (transcribing bubble, voice-error bubble, Ben-typing indicator) and the older-page spinner are rendered via `FlatList` header/footer props — **mapped to inverted coordinates**:

- In an inverted list, `ListHeaderProps` renders at the visual **bottom**, `ListFooterProps` at the visual **top**.
- Live/in-flight session UI (transcribing, voice-error, Ben-typing) must appear at the **bottom** (newest) → render them in `ListHeaderComponent`.
- The older-page loading spinner appears at the **top** → `ListFooterComponent`.

```tsx
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import { Typography } from "@/layout/components/ui/typography";
import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";
import { useMessagesStore } from "@/pages/chat/stores/messages-store";
import { getMessageText } from "@/pages/chat/utils/chat-messages";
import type { BenUiMessage } from "@/pages/chat/utils/chat-messages";
import { useChatList } from "@/pages/chat/hooks/use-chat-list";
import { CaptureCard } from "@/pages/chat/components/capture-card";
import { MessageBubble } from "@/pages/chat/components/message-bubble/message-bubble";
import { RetryFooter } from "@/pages/chat/components/message-footers/retry-footer";
import { SendRetryFooter } from "@/pages/chat/components/message-footers/send-retry-footer";
import { TranscribingFooter } from "@/pages/chat/components/message-footers/transcribing-footer";
import { TypingIndicator } from "@/pages/chat/components/typing-indicator";

export function ChatHistory() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const isAwaitingReply = useMessagesStore((store) => store.isAwaitingReply);
  const sendError = useMessagesStore((store) => store.sendError);
  const sessionMessages = useMessagesStore((store) => store.sessionMessages);

  const { data, loadOlder, isFetchingOlder } = useChatList();

  const failedMessageId = sendError
    ? sessionMessages[sessionMessages.length - 1]?.id
    : undefined;

  const renderItem = ({ item }: { item: BenUiMessage }) => {
    const text = getMessageText(item);
    const isBen = item.role === "assistant";
    const capture = item.metadata?.capture;
    const isFailed = item.id === failedMessageId;

    return (
      <MessageBubble
        from={isBen ? "ben" : "user"}
        state={isFailed ? "error" : "default"}
        footer={isFailed ? <SendRetryFooter /> : undefined}
        className="mb-4"
      >
        {text}
        {isBen && capture && (
          <CaptureCard.Root kind={capture.kind}>
            <CaptureCard.Icon />
            <CaptureCard.Body>
              <CaptureCard.Header />
              <CaptureCard.Title>{capture.title}</CaptureCard.Title>
              {capture.meta && <CaptureCard.Meta>{capture.meta}</CaptureCard.Meta>}
              <CaptureCard.Action
                onAction={() => router.push(`/tasks/${capture.itemId}`)}
              />
            </CaptureCard.Body>
          </CaptureCard.Root>
        )}
      </MessageBubble>
    );
  };

  return (
    <FlatList
      inverted
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={loadOlder}
      onEndReachedThreshold={0.2}
      contentContainerClassName="px-4 pt-2"
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="gap-4">
          {voiceStatus === "transcribing" && (
            <MessageBubble from="user" state="pending" footer={<TranscribingFooter />}>
              <Typography variant="body-md" className="italic text-on-primary/70">
                …
              </Typography>
            </MessageBubble>
          )}
          {voiceStatus === "error" && (
            <MessageBubble from="user" state="error" footer={<RetryFooter />}>
              couldn't catch that — tap to retry or type it instead
            </MessageBubble>
          )}
          {isAwaitingReply && (
            <View className="w-full items-start">
              <View className="flex-col items-start gap-1">
                <View className="ml-1">
                  <Typography variant="label-caps" className="text-on-surface-variant">
                    Ben
                  </Typography>
                </View>
                <TypingIndicator />
              </View>
            </View>
          )}
        </View>
      }
      ListFooterComponent={
        isFetchingOlder ? (
          <View className="w-full items-center py-2">
            <TypingIndicator />
          </View>
        ) : null
      }
    />
  );
}
```

Notes / rationale:
- **Inversion = scroll preservation.** When `fetchNextPage` prepends older messages (older = higher index in the newest-first `data`), the inverted `FlatList` keeps the visible items pinned — no `window.scrollBy` compensation needed. This is the whole point of the rewrite (analysis line 104).
- **`onEndReached` replaces `IntersectionObserver`.** In an inverted list "end" = visual top, exactly where the web observer's `topRef` sentinel sat. `onEndReachedThreshold={0.2}` ≈ the web `rootMargin: "200px 0px 0px 0px"` prefetch margin.
- **Header/Footer inversion mapping** (explained above) keeps the live bubbles at the bottom and the older-page spinner at the top, matching web visual order.
- **Per-item bottom margin** (`mb-4`) replaces the web `gap-4` on the flex column (FlatList has no `gap`; spacing goes on the item or via `ItemSeparatorComponent` — `mb-4` on the bubble is the simplest faithful equivalent and the header `View` keeps its own `gap-4`).
- The web `<span className="italic …">…</span>` placeholder becomes a `Typography` with the same `italic text-on-primary/70` classes (a bare string would lose the italic styling).
- **`router.push(\`/tasks/${capture.itemId}\`)`** replaces `<Link to={ROUTES.taskWorkspace(capture.itemId)}>`. expo-router route assumed `/tasks/[taskId]` per `MOBILE-PORT-ANALYSIS.md` line 69. (If the actual route segment differs, it is fixed in the page-assembly plan 16/20 — this plan uses the analysis-documented path.)
- `scrollToBottom` / auto-scroll-on-new-message is **explicitly NOT here** — plan 15 owns that. The inverted list already starts pinned at the bottom (data[0]), so initial render needs no extra work.

## Step 9 — Chat history skeleton (`chat-history/chat-history-skeleton.tsx`)

Initial-load placeholder. `<section>`→`View`; alternating Ben skeleton bubbles + user pulse bars. `animate-pulse` user bars → `PulseView`. Ben skeletons → `MessageBubble state="skeleton"` (which itself uses `PulseView`). Copy the web alternation/widths verbatim.

```tsx
import { View } from "react-native";
import { MessageBubble } from "@/pages/chat/components/message-bubble/message-bubble";
import { PulseView } from "@/pages/chat/components/pulse-view";

function UserSkeletonBar({ widthClass }: { widthClass: string }) {
  return (
    <View className="w-full items-end">
      <PulseView className={`h-9 rounded-2xl rounded-tr-sm bg-outline-variant ${widthClass}`} />
    </View>
  );
}

export function ChatHistorySkeleton() {
  return (
    <View className="flex-1 flex-col justify-end gap-3 pt-2 px-4">
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-48" />
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-56" />
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-40" />
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-56" />
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-32" />
      <MessageBubble from="ben" state="skeleton" />
    </View>
  );
}
```

> `UserSkeletonBar` is a tiny local presentational helper (one component per file rule: it lives in the same skeleton file but if `tsc`/review flags it, split to `user-skeleton-bar.tsx` — kept inline here because it is render-only scaffolding with no reuse, matching the web file which inlined the bars). The skeleton is **not** rendered by `ChatHistory` itself — the chat-page assembly (plan 16) switches between `ChatHistorySkeleton` (when `useChatList().isLoading`) and `ChatHistory`. This plan only provides both components.

---

## Final file layout (exhaustive — nothing outside these)

```
project-mobile/src/pages/chat/
├── components/
│   ├── chat-history/
│   │   ├── chat-history.tsx              (Step 8)
│   │   └── chat-history-skeleton.tsx     (Step 9)
│   ├── message-bubble/
│   │   └── message-bubble.tsx            (Step 4)
│   ├── message-footers/
│   │   ├── retry-footer.tsx              (Step 5)
│   │   ├── send-retry-footer.tsx         (Step 5)
│   │   └── transcribing-footer.tsx       (Step 5)
│   ├── capture-card/
│   │   ├── index.tsx                     (Step 3)
│   │   ├── capture-card-root.tsx         (Step 3)
│   │   ├── capture-card-icon.tsx         (Step 3)
│   │   ├── capture-card-body.tsx         (Step 3)
│   │   ├── capture-card-header.tsx       (Step 3)
│   │   ├── capture-card-title.tsx        (Step 3)
│   │   ├── capture-card-meta.tsx         (Step 3)
│   │   ├── capture-card-supporting-text.tsx (Step 3)
│   │   ├── capture-card-action-button.tsx   (Step 3)
│   │   ├── capture-card-error-button.tsx    (Step 3)
│   │   ├── contexts/
│   │   │   └── capture-card-context.ts   (Step 2)
│   │   └── types/
│   │       └── index.ts                  (Step 1)
│   ├── typing-indicator.tsx              (Step 6)
│   ├── bouncing-dots.tsx                 (Step 6)
│   └── pulse-view.tsx                    (Step 6)
└── hooks/
    └── use-chat-list.ts                  (Step 7)
```

## Conventions honored

- **One component per file** (memory) — `bouncing-dots`/`pulse-view` extracted from the web's single typing-indicator/inline-skeleton-spans into their own files.
- **No barrel/export-only files** (memory) — `capture-card/index.tsx` is a value (compound API), `types/index.ts` is a concrete type module; neither is a pure re-export.
- **`createID()` / ID typing** memory: N/A — this layer reads `capture.itemId` (a `string`) and `message.id`, does not construct IDs.
- **kebab-case** filenames, PascalCase components, function declarations, destructured props, **no comments** (code-write-code).
- **Component-variant-map** pattern preserved (`DEFAULT_TASK_ACTION_LABEL`, `KIND_ICON`, `KIND_LABEL`, `variantClasses` via `Typography`).
- **NativeWind classNames kept byte-for-byte** wherever an RN equivalent exists; only web-only utilities (`inline-flex`, hover/transition/focus, `currentColor` inheritance) are translated as documented.

## Things explicitly NOT done here (parallel-safety)

- `use-scroll-to-bottom` / auto-scroll on new message → plan 15.
- The chat page assembly / skeleton↔list switch / footer / keyboard avoidance → plan 16.
- Any edit to `@/api/*`, `@/layout/*`, `messages-store`, `voice-store`, `use-chat-messages` (consumed via public interface only).
- No markdown/rich-text step (analysis: plain text).
- No formatting / lint step.

## Open risks to flag (do not resolve from here)

1. **NativeWind SVG color cssInterop** — if plan 01 did not wire `react-native-svg` className→color, the lucide icons' `className="text-*"` won't paint. Fallback: pass `color={tokenHex}` to each icon. Lives entirely within these files.
2. **expo-router task route segment** — `router.push(\`/tasks/${id}\`)` assumes the analysis-documented `/tasks/[taskId]` route exists (created by a later page plan). If the segment differs, fix is a one-liner in `chat-history.tsx`.
3. **`onEndReached` over-fire** on inverted lists — mitigated by the `hasMore && !isFetchingNextPage` guard in `use-chat-list.ts` plus React Query in-flight de-dupe.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass for all files above. Any failure on `@/api/*`, `@/layout/*`, `react-native-reanimated`, `expo-router`, or `lucide-react-native` imports indicates an upstream dependency gap (plans 01–11), not this unit — do not work around it by changing import paths.
