# Implementation Plan — Chat shell: empty state, suggested action, top bar, top banner (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively:** `project-mobile/src/pages/chat/components/chat-empty-state/`, `project-mobile/src/pages/chat/components/suggested-action.tsx`, `project-mobile/src/pages/chat/components/chat-top-bar/`, `project-mobile/src/pages/chat/components/chat-top-banner/`.
> **Parallel-safe:** touches no file outside those four locations. Distinct from plans 12/13/15 (other chat-component folders). `suggested-action.tsx` was **moved into this plan** from plan 13 (Stage 3 overlap resolution) — its only consumer is `chat-empty-state`, so co-locating ownership removes the cross-parallel coupling. Do NOT touch `active-task-peek` (stays in plan 13).
> **Depends on:** plan 10 (chat backbone — `messages-store`, `use-chat-messages`, consumes `connectivity-store`), plan 11 (shared `chat-banner` namespace + `brand-mark`), plan 05 (UI primitives: `IconButton`, `Typography`), plan 03 (tokens + `cn()`), plan 17/07 (`voice-store`). The menu-trigger in the top bar is wired to navigation later by plan 28.
> **Verification:** `cd project-mobile && npx tsc --noEmit`. **No formatting/lint step** for this unit.
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port the four web chat-shell pieces to React Native / Expo (NativeWind v4), keeping NativeWind classNames byte-for-byte where an RN equivalent exists:

- **`chat-empty-state`** — idle hero (circular icon badge + headline + helper line) and a "Suggested Actions" section that renders `SuggestedAction` chips.
- **`suggested-action`** — a single pressable action chip (icon + label + trailing arrow).
- **`chat-top-bar`** — `BrandMark` on the leading side + a menu-trigger `IconButton` on the trailing side, exposing an `onOpenMenu` prop (wiring deferred to plan 28).
- **`chat-top-banner`** — connectivity / voice-status banner built on the shared `chat-banner` namespace, driven by `connectivity-store` + `voice-store`.

### RN mapping applied (same table plans 05/11 use)

| web | mobile |
|---|---|
| `<section>` / `<div>` | `View` |
| `<button>` | `Pressable` |
| `<span>` (text) | `Text` (or `Typography`, which wraps `Text`) |
| `onClick` | `onPress` |
| `aria-label` | `accessibilityLabel` (via `IconButton`'s `label`) |
| `hover:` / `group-hover:` / `transition-*` | dropped (no hover on touch); pressed feedback via `pressed` style |
| `lucide-react` | `lucide-react-native` |

---

## Prerequisite assumptions (delivered by dependency plans — verify with `tsc`, do not create here)

From plan 05 (`src/layout/components/ui/`):
- `IconButton` — props `{ label, children, className?, onPress? }`. `label`→`accessibilityLabel`. **Does NOT set icon color on the wrapper** (per plan 05 Step 2 decision — RN does not propagate `text-*` through `Pressable` to a child). The icon child must carry its own color class. So our menu icon must set `text-primary` itself.
- `Typography` — props `{ variant, className?, children, ...TextProps }`. Variants: `wordmark | tagline | headline-lg | body-md | button-text | label-caps`. Renders over `Text`. **Note:** the web "button" variant is named `"button-text"` in mobile (plan 05 Step 3). The suggested-action label uses a raw `text-button font-semibold` class (not the `Typography` variant) on web, mirrored below.

From plan 11 (`src/layout/components/`):
- `ChatBanner` namespace object (`@/layout/components/chat-banner`) — `{ Root, Icon, Text, Action, Dismiss }`, RN ports keeping the compound API + Jotai/Context tone. `Root` props `{ tone?: "info" | "warn" | "error", children, className? }`. `Icon` props `{ icon }`. `Text` props `{ children }`. `Action` props `{ label, onPress? }` (web's `onClick`→`onPress`). `Dismiss` props `{ onPress? }`.
  - **Cross-plan contract flag:** the web `ChatBanner.Action`/`ChatBanner.Dismiss` use `onClick`. This unit assumes plan 11 ports them to `onPress`. If plan 11 ships them still as `onClick`, `tsc` will surface it — that is an upstream gap in plan 11, not this unit. Code below uses `onPress`.
- `BrandMark` (`@/layout/components/brand-mark`) — props `{ orientation?, logoWidth?, logoHeight?, className?, itemClassName? }`. RN port wraps `BenLogo` (react-native-svg) + `Typography variant="wordmark"`.

From plan 10 (chat backbone, consumed read-only):
- `useConnectivityStore` (`@/layout/stores/connectivity-store`) — selector `(store) => store.isOffline`. (Plan 10 notes connectivity is reimplemented over NetInfo upstream; we consume its public interface.)

From plan 17/07 (voice store, consumed read-only):
- `useVoiceStore` + `selectVoiceStatus` (`@/layout/stores/voice-store`) — `selectVoiceStatus` returns `"idle" | "recording" | "transcribing" | "error"`; store exposes `retryVoice()`, `dismissError()`, `micPermission: "granted" | "denied" | "prompt"`.

If any prerequisite import is absent at implementation time, **do not add it here** (out of scope / breaks parallel-safety) — `tsc` surfaces it as an upstream dependency gap.

---

## Step 1 — `src/pages/chat/components/suggested-action.tsx`

A single full-width pressable chip: leading lucide icon, flexible label, trailing arrow. `<button>`→`Pressable`; `onClick`→`onPress`; drop `group`/`hover:`/`transition-colors` (no hover on touch). The label keeps the raw web classes `text-button font-semibold text-on-surface` (web used a `<span>`, mirrored with `Text`). Icons are `lucide-react-native` (passed by the consumer, typed structurally so any lucide-native icon component fits).

Web reference: `project-web/src/pages/chat/components/suggested-action.tsx`.

```tsx
import { ArrowRight } from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";
import { Pressable, Text } from "react-native";
import { cn } from "@/layout/utils/styles";

type SuggestedActionProps = {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
  className?: string;
  onPress?: () => void;
};

export function SuggestedAction({
  icon: Icon,
  children,
  className,
  onPress,
}: SuggestedActionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={({ pressed }) =>
        cn(
          "w-full flex-row items-center gap-4 rounded-lg bg-surface-container-low p-4",
          pressed && "bg-surface-container-high",
          className,
        )
      }
    >
      <Icon className="size-5 text-on-surface-variant" strokeWidth={1.75} />
      <Text className="flex-1 text-button font-semibold text-on-surface">
        {children}
      </Text>
      <ArrowRight className="size-4 text-on-surface-variant" strokeWidth={1.75} />
    </Pressable>
  );
}
```

Notes / rationale:
- `group … hover:bg-surface-container-high` + `group-hover:text-primary` are hover-only → dropped. Pressed feedback maps `hover:bg-surface-container-high` onto the `pressed` background. The icon's `group-hover:text-primary` has no touch equivalent and is dropped (icon stays `text-on-surface-variant`).
- `text-left` (web) is dropped; RN `Text` is start-aligned by default.
- `flex w-full items-center gap-4` → `w-full flex-row items-center gap-4` (RN default flex direction is column, so `flex-row` is explicit).
- Icon color via NativeWind `text-*` className relies on plan 05's lucide-react-native cssInterop (same caveat plan 05 documents for icons). The `ComponentType<{ className?; strokeWidth? }>` prop type matches the lucide-react-native icon signature and is consistent with web's prop type.
- `transition-colors` dropped (no transition primitive needed; touch feedback is immediate).

## Step 2 — `src/pages/chat/components/chat-empty-state/chat-empty-state.tsx`

Idle hero + Suggested Actions section. `<section>`/`<div>`→`View`; copy text into `Typography`. The empty state returned a web Fragment with two `<section>`s; in RN we wrap in a single `View` (Fragments can't carry the flex layout, and the parent chat-page layout — plan 16 — expects a view). Keep the same two logical regions and their classNames.

Web reference: `project-web/src/pages/chat/components/chat-empty-state/chat-empty-state.tsx`.

```tsx
import { Bell, MessageCircle, NotebookPen } from "lucide-react-native";
import { View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { SuggestedAction } from "@/pages/chat/components/suggested-action";

export function ChatEmptyState() {
  return (
    <View className="flex-1">
      <View className="flex-1 flex-col items-center justify-center gap-4">
        <View className="size-16 items-center justify-center rounded-full bg-surface-container-high">
          <MessageCircle
            className="size-7 text-on-surface-variant"
            strokeWidth={1.5}
          />
        </View>
        <View className="max-w-[280px] flex-col items-center gap-2">
          <Typography variant="tagline" className="text-on-surface text-center">
            No recent messages.
          </Typography>
          <Typography
            variant="body-md"
            className="text-on-surface-variant text-center"
          >
            Let's get started — tap the mic or type to tell Ben anything.
          </Typography>
        </View>
      </View>

      <View className="-mb-10 mt-8 flex-col gap-2 border-t border-surface-variant pt-4">
        <Typography
          variant="label-caps"
          className="ml-1 mb-1 text-on-surface-variant"
        >
          Suggested Actions
        </Typography>
        <SuggestedAction icon={Bell}>Remind me to...</SuggestedAction>
        <SuggestedAction icon={NotebookPen}>
          Create a note about...
        </SuggestedAction>
      </View>
    </View>
  );
}
```

Notes / rationale:
- Web Fragment → outer `View className="flex-1"` so the inner `flex-1` hero region can expand and push the Suggested Actions section to the bottom (preserving the web `flex flex-1` + bottom section layout). The hero region keeps `flex-1 ... items-center justify-center`.
- Badge `text-on-surface-variant` (web set it on the badge `<div>` for icon color inheritance) → moved onto the `MessageCircle` icon itself, since RN does not inherit color from the `View` to the icon (same rule as plan 05 IconButton). Badge `View` keeps only `bg-surface-container-high`.
- `text-center` (web on the headline/helper wrapper `<div>`) is applied per-`Typography` via className because RN `Text` alignment is not inherited from a parent `View`. The wrapper keeps `items-center` for horizontal centering of the block.
- `flex` web utility on each container is implicit in RN; `flex-col` kept explicit where the web set a column (`flex-col`), matching web class strings. The two `flex flex-col` web sections become `flex-col` (RN is column by default but keeping `flex-col` matches the web class text and is harmless).
- Negative margin `-mb-10` and `mt-8`, `border-t border-surface-variant`, `pt-4`, `ml-1 mb-1` copied verbatim.
- **Suggested-action coupling is now internal** (moved into this plan), so the import is a normal local import — no lazy/optional indirection needed. The simple-plan's "keep import lazy" note is superseded by the Stage 3 ownership move.

## Step 3 — `src/pages/chat/components/chat-top-bar/chat-top-bar.tsx`

Leading `BrandMark`, trailing menu-trigger `IconButton`. `<div>`→`View`; keep `memo`. **Prop is `onOpenMenu`** per this plan's brief (web used `onMenu`; renamed to match the brief and the plan-28 wiring contract). The `Menu` icon carries `text-primary` itself (plan 05 `IconButton` does not color its child).

Web reference: `project-web/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx`.

```tsx
import { Menu } from "lucide-react-native";
import { memo } from "react";
import { View } from "react-native";
import { BrandMark } from "@/layout/components/brand-mark";
import { IconButton } from "@/layout/components/ui/icon-button";

type ChatTopBarProps = {
  onOpenMenu: () => void;
};

function ChatTopBarComponent({ onOpenMenu }: ChatTopBarProps) {
  return (
    <View className="h-16 flex-row items-center justify-between px-6">
      <BrandMark logoWidth={28} logoHeight={22} />
      <IconButton label="Menu" onPress={onOpenMenu}>
        <Menu className="size-6 text-primary" />
      </IconButton>
    </View>
  );
}

export const ChatTopBar = memo(ChatTopBarComponent);
```

Notes / rationale:
- `flex h-16 items-center justify-between px-6` → `h-16 flex-row items-center justify-between px-6` (RN needs explicit `flex-row` for the leading/trailing layout).
- `onMenu`→`onOpenMenu` per brief; `onClick`→`onPress` on the `IconButton`.
- `Menu` icon gets `text-primary` (web relied on the IconButton wrapper's `text-primary` + `currentColor`; mobile IconButton dropped that, so the icon colors itself). The `size-6` is preserved.
- `BrandMark logoWidth={28} logoHeight={22}` copied verbatim.
- `accessibilityLabel` "Menu" preserved via `IconButton`'s `label` prop (the brief requires preserving the accessible label).
- `memo` kept (web used it; harmless and matches reference). Plan 28 will pass a real navigation callback as `onOpenMenu`.

## Step 4 — `src/pages/chat/components/chat-top-banner/chat-top-banner.tsx`

Connectivity / voice-status banner. Same precedence the web file uses: **offline → voice error → mic denied → render nothing**. `<div>`→`View`; build on the shared `ChatBanner` namespace; `lucide-react`→`lucide-react-native`; `onClick`→`onPress`. **Mic-denied copy changed from "browser settings" → "device settings"** (the only copy change, per brief step 3).

Web reference: `project-web/src/pages/chat/components/chat-top-banner/chat-top-banner.tsx`.

```tsx
import { AlertCircle, TriangleAlert, WifiOff } from "lucide-react-native";
import { memo } from "react";
import { View } from "react-native";
import { ChatBanner } from "@/layout/components/chat-banner";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";

function ChatTopBannerComponent() {
  const retryVoice = useVoiceStore((store) => store.retryVoice);
  const dismissError = useVoiceStore((store) => store.dismissError);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const micPermission = useVoiceStore((store) => store.micPermission);
  const isOffline = useConnectivityStore((store) => store.isOffline);

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

export const ChatTopBanner = memo(ChatTopBannerComponent);
```

Notes / rationale:
- Store selectors, the three conditions, precedence, and tone mapping (offline→`warn`, voice error→`error`, mic denied→`warn`) are copied verbatim from web — these stores are platform-agnostic / reimplemented over native APIs upstream (plans 07/10/17), and this file consumes only their public interface. **No direct browser APIs** are used here (brief step 4).
- `lucide-react`→`lucide-react-native` for `WifiOff`, `AlertCircle`, `TriangleAlert`.
- `onClick`→`onPress` on `ChatBanner.Action` (Retry → `retryVoice`) and `ChatBanner.Dismiss` (→ `dismissError`). The mic-denied `Dismiss` has no handler in web (defaults inside `ChatBanner.Dismiss`), preserved.
- Copy change: `"turn on mic in browser settings."` → `"turn on mic in device settings."` (mic-denied guidance now references the device, per brief). All other copy strings byte-for-byte identical to web.
- Wrapper `px-4 pb-2` copied verbatim. `memo` kept.

---

## Files created (exhaustive — nothing outside the four owned locations)

```
project-mobile/src/pages/chat/components/
├── suggested-action.tsx                        (Step 1)
├── chat-empty-state/
│   └── chat-empty-state.tsx                     (Step 2)
├── chat-top-bar/
│   └── chat-top-bar.tsx                         (Step 3)
└── chat-top-banner/
    └── chat-top-banner.tsx                      (Step 4)
```

No `index.ts`/barrel files (memory: no export-only files). One component per file (memory). All file names kebab-case; exported identifiers PascalCase. `suggested-action.tsx` is a single-file component (its only consumer is the co-located empty state), matching the web layout and the page-structure "small unique component" pattern.

## Conventions honored

- **kebab-case** file/folder names; PascalCase component identifiers (page-structure).
- **Destructured props, function declarations, no default exports, no comments** (code-write-code skill).
- **Shared primitives/stores reused, never reduplicated** — `Typography`, `IconButton`, `BrandMark`, `ChatBanner`, `useConnectivityStore`, `useVoiceStore`/`selectVoiceStatus` are all imported from their owning plans.
- **NativeWind class parity** with web wherever an RN equivalent exists; hover/transition utilities dropped, pressed feedback via the `pressed` callback (matches plans 05/11).
- **No formatting/lint step** for this unit.

## Things explicitly NOT done in this unit

- No menu navigation wiring — `ChatTopBar` only exposes `onOpenMenu`; plan 28 wires it.
- No edits to `@/layout/*` primitives, `chat-banner`, `brand-mark`, or the connectivity/voice stores (consumed via their public interfaces; owned by plans 05/07/10/11/17).
- No chat-page assembly / layout composition (plan 16) — these four components are leaf shell pieces only.
- No `active-task-peek` (stays in plan 13).

## Verification

From `project-mobile/`:

```bash
npx tsc --noEmit
```

Must pass with no errors. If `tsc` fails on imports of `@/layout/components/ui/*`, `@/layout/components/chat-banner`, `@/layout/components/brand-mark`, `@/layout/stores/connectivity-store`, `@/layout/stores/voice-store`, or `lucide-react-native`, the failure is an upstream dependency gap (plans 01/03/05/07/10/11/17), not this unit.

Behavioral self-check (read-only reasoning, no runtime in this unit):
1. `ChatEmptyState` renders the hero + two `SuggestedAction` chips and nothing else.
2. `SuggestedAction` is a `Pressable` firing `onPress`, with leading icon + label + trailing arrow.
3. `ChatTopBar` shows `BrandMark` leading + menu `IconButton` trailing, fires `onOpenMenu`, accessible label "Menu" preserved.
4. `ChatTopBanner` renders exactly one banner for the first matching condition (offline → voice error → mic denied) and `null` when all clear; mic-denied copy says "device settings".
