# Plan 11 — Shared composite components (chat-input, chat-banner, brand-mark) → project-mobile

Code-level implementation plan to port the three shared composite layout components from `project-web` to `project-mobile` (Expo + React Native + NativeWind), preserving the **React-context compound-component** pattern (`Root` + named parts sharing a `createContext` value). **DO NOT implement yet.**

> The plan brief calls these "Jotai-context" components, but the web source shares state through React `createContext`/`useContext`, **not** Jotai. This plan keeps the React-context pattern verbatim. Jotai only owns the input draft *elsewhere* (plan 10 chat backbone); the draft arrives here as a prop, exactly as on web.

## Owned files (parallel-safe — touch nothing else)

- `project-mobile/src/layout/components/chat-input/` — `chat-input-root.tsx`, `chat-input-input.tsx`, `chat-input-action-button.tsx`, `chat-input-attach-button.tsx`, `index.tsx`, `contexts/chat-input.ts`
- `project-mobile/src/layout/components/chat-banner/` — `chat-banner-root.tsx`, `chat-banner-text.tsx`, `chat-banner-icon.tsx`, `chat-banner-action.tsx`, `chat-banner-dismiss.tsx`, `index.tsx`, `contexts/tone.ts`
- `project-mobile/src/layout/components/brand-mark.tsx`

## Dependencies (provided by other plans — consume, do not create)

| Symbol | Mobile source | Provided by |
| --- | --- | --- |
| `cn` | `@/layout/utils/styles` | plan 03 (tokens/utils) |
| `Typography` (variant `body-md`, `wordmark`) | `@/layout/components/ui/typography` | plan 05 (primitives) |
| `BenLogo` | `@/layout/components/icons/ben-logo` | plan 05 (primitives) |
| color/text tokens (`surface-container-high`, `primary`, `on-primary`, `text-error`, …) | NativeWind config | plan 03 |
| `useVoiceStore`, `selectVoiceStatus` | `@/layout/stores/voice-store` | plan 07 (global stores) |
| `useConnectivityStore` | `@/layout/stores/connectivity-store` | plan 07 |
| `useCanRecord` | `@/layout/hooks/use-can-record` | plan 08 (specialized hooks) |
| `Mic`, `Send`, `Plus`, `X` icons | `lucide-react-native` | plan 01 dep set |

> These imports are written against the **expected** mobile API (identical names/paths to web, swapping `lucide-react`→`lucide-react-native`). If any differs at integration time, only the import line changes — no structural change.

### Web→RN substitution rules applied throughout

- `<div>` → `View`, `<input>` → `TextInput`, `<button>` → `Pressable`, text → `Typography`/`Text`.
- NativeWind `className` strings preserved verbatim where the utility exists on the migrated tokens.
- Drop web-only affordances: `focus-within:*`, `hover:*`, `transition-colors`, `focus:outline-none`, `focus:ring-0`, `role`, `aria-label`, `type="text"`/`type="button"`. Replace with native equivalents: `accessibilityLabel`, `accessibilityRole`, `Pressable` `disabled`, and pressed-state feedback via the `({ pressed }) => className` form.
- `lucide-react-native` icons take a numeric `size` / `color` prop, **not** Tailwind `size-*`/`text-*` className. Convert `size-5`→`size={20}`, `size-4`→`size={16}`, `size-3.5`→`size={14}`; resolve color from the token (hard-coded hex from plan-03 palette or `currentColor` if the lib supports it — see "Open detail" below).

---

## Part A — `chat-input` composite

Compound API preserved exactly: `ChatInput = { Root, AttachButton, Input, ActionButton }`. Context value type unchanged.

### A1. `contexts/chat-input.ts` — verbatim (no DOM types)

This file has zero DOM dependency; copy it as-is.

```ts
import { createContext, useContext } from "react";

export type ChatInputContextValue = {
  disabled: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export const ChatInputContext = createContext<ChatInputContextValue | null>(
  null,
);

export function useChatInputContext() {
  const value = useContext(ChatInputContext);

  if (!value) {
    throw new Error("ChatInput parts must be used within ChatInput.Root");
  }

  return value;
}
```

### A2. `chat-input-root.tsx` — `<div>` → `View`

Same props (`draft`, `onDraftChange`, `onSend`, `disabled`, `children`, `className`). Drop `focus-within:*` (no focus-within in RN) and `transition-colors`. Keep radius/surface/padding/shadow and the `disabled` opacity. The web shadow `shadow-[0_4px_12px_rgba(0,0,0,0.03)]` is an arbitrary NativeWind value — keep it; NativeWind maps it to RN shadow/elevation (acceptable; if it fails type/runtime at integration, drop it — non-load-bearing).

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { cn } from "@/layout/utils/styles";
import { ChatInputContext } from "./contexts/chat-input";

type ChatInputRootProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export function ChatInputRoot({
  draft,
  onDraftChange,
  onSend,
  disabled = false,
  children,
  className,
}: ChatInputRootProps) {
  return (
    <ChatInputContext.Provider value={{ draft, onDraftChange, onSend, disabled }}>
      <View
        className={cn(
          "w-full flex-row items-center rounded-full border border-transparent bg-surface-container-high px-2 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)]",
          disabled && "opacity-60",
          className,
        )}
      >
        {children}
      </View>
    </ChatInputContext.Provider>
  );
}
```

> Note: web `flex w-full items-center` is row by default in flexbox; RN defaults to `column`, so add `flex-row` to preserve the horizontal layout.

### A3. `chat-input-input.tsx` — `<input>` → `TextInput`

Replace `onChange`/`event.target.value` with `onChangeText`. Replace web "Enter to send" `onKeyDown` with RN `onSubmitEditing` (single-line message field) plus `returnKeyType="send"` and `blurOnSubmit={false}` so the keyboard stays up after send. Keep `editable={!disabled}`. Placeholder color goes through the `placeholderTextColor` prop (RN ignores `placeholder:*` className), sourced from the plan-03 token; keep the className for the rest.

```tsx
import { TextInput } from "react-native";
import { useChatInputContext } from "./contexts/chat-input";

type ChatInputInputProps = {
  placeholder?: string;
};

export function ChatInputInput({
  placeholder = "Message Ben...",
}: ChatInputInputProps) {
  const { draft, onDraftChange, onSend, disabled } = useChatInputContext();

  function handleSubmit() {
    if (!disabled) {
      onSend();
    }
  }

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={ON_SURFACE_VARIANT_60}
      value={draft}
      onChangeText={onDraftChange}
      onSubmitEditing={handleSubmit}
      editable={!disabled}
      returnKeyType="send"
      blurOnSubmit={false}
      className="min-w-0 flex-1 bg-transparent px-2 text-body-md text-on-surface"
    />
  );
}
```

> `min-w-0` is a no-op in RN but harmless; keep `flex-1` for the grow behavior. `ON_SURFACE_VARIANT_60` = the hex of the `on-surface-variant` token at 60% from plan 03's palette (see "Open detail — placeholder color"). Dropped web-only classes: `border-none`, `focus:outline-none`, `focus:ring-0`, `placeholder:*`.

### A4. `chat-input-action-button.tsx` — `<button>` → `Pressable`, lucide-react-native

Logic preserved 1:1: pull `startRecording`, `voiceStatus`, `isOffline`, `canRecord` from the same stores/hook; same `isTranscribing`/`isSendingDisabled`/`hasText` derivations; same two-branch render (Send when text, Mic otherwise) with identical disabled conditions. Web→RN: `onClick`→`onPress`, `aria-label`→`accessibilityLabel`, drop `hover:`/`transition-colors`, icon className→`size`/`color`. Keep `disabled` and the `disabled:opacity-60` via a pressed/disabled-aware className (use the `disabled && "opacity-60"` form since NativeWind's `disabled:` variant is unreliable on `Pressable`).

```tsx
import { Mic, Send } from "lucide-react-native";
import { Pressable } from "react-native";
import { useCanRecord } from "@/layout/hooks/use-can-record";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";
import { cn } from "@/layout/utils/styles";
import { useChatInputContext } from "./contexts/chat-input";

export function ChatInputActionButton() {
  const startRecording = useVoiceStore((store) => store.startRecording);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const isOffline = useConnectivityStore((store) => store.isOffline);

  const canRecord = useCanRecord();

  const { draft, onSend, disabled } = useChatInputContext();

  const isTranscribing = voiceStatus === "transcribing";
  const isSendingDisabled = !disabled && (isOffline || isTranscribing);
  const hasText = draft.length > 0;

  const baseClassName =
    "ml-2 size-10 shrink-0 items-center justify-center rounded-full bg-primary";

  if (hasText) {
    const sendDisabled = disabled || isSendingDisabled;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        onPress={onSend}
        disabled={sendDisabled}
        className={cn(baseClassName, sendDisabled && "opacity-60")}
      >
        <Send size={20} strokeWidth={2} color={ON_PRIMARY} />
      </Pressable>
    );
  }

  const recordDisabled = disabled || !canRecord;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voice input"
      onPress={startRecording}
      disabled={recordDisabled}
      className={cn(baseClassName, recordDisabled && "opacity-60")}
    >
      <Mic size={20} color={ON_PRIMARY} />
    </Pressable>
  );
}
```

> `flex` removed (RN Views are flex by default). `ON_PRIMARY` = hex of `on-primary` token. Hover branch (`hover:bg-inverse-surface`) dropped — no hover on touch; optional pressed feedback could be added later but is out of scope.

### A5. `chat-input-attach-button.tsx` — `<button>` → `Pressable`

Same `onClick?` prop (renamed handler usage to `onPress`), reads `disabled` from context. Drop hover/transition. Plus icon over lucide-react-native.

```tsx
import { Plus } from "lucide-react-native";
import { Pressable } from "react-native";
import { cn } from "@/layout/utils/styles";
import { useChatInputContext } from "./contexts/chat-input";

type ChatInputAttachButtonProps = {
  onPress?: () => void;
};

export function ChatInputAttachButton({ onPress }: ChatInputAttachButtonProps) {
  const { disabled } = useChatInputContext();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Attach"
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "size-10 shrink-0 items-center justify-center rounded-full",
        disabled && "opacity-60",
      )}
    >
      <Plus size={20} color={ON_SURFACE_VARIANT} />
    </Pressable>
  );
}
```

> **API note:** web prop is `onClick`; RN convention is `onPress`. Renamed to `onPress` to match the platform and the action-button's `onPress` consistency. Consumers (plans 15/24) are not yet written, so this is the canonical mobile contract — document it. The web `hover:text-primary` color shift is dropped; icon uses the static `on-surface-variant` token color.

### A6. `index.tsx` — verbatim (compound object)

```tsx
import { ChatInputActionButton } from "./chat-input-action-button";
import { ChatInputAttachButton } from "./chat-input-attach-button";
import { ChatInputInput } from "./chat-input-input";
import { ChatInputRoot } from "./chat-input-root";

export const ChatInput = {
  Root: ChatInputRoot,
  AttachButton: ChatInputAttachButton,
  Input: ChatInputInput,
  ActionButton: ChatInputActionButton,
};
```

---

## Part B — `chat-banner` composite

Compound API preserved: `ChatBanner = { Root, Icon, Text, Action, Dismiss }`. Tone context unchanged.

### B1. `contexts/tone.ts` — verbatim (no DOM)

```ts
import { createContext, useContext } from "react";

export type ChatBannerTone = "info" | "warn" | "error";

export const ChatBannerToneContext = createContext<ChatBannerTone>("info");

export function useChatBannerTone() {
  return useContext(ChatBannerToneContext);
}
```

### B2. `chat-banner-root.tsx` — `<div>` → `View`

Keep the `toneClasses` map and props (`tone`, `children`, `className`) verbatim. `role="status"`→`accessibilityRole="alert"` (closest RN role; or drop with `accessibilityLiveRegion="polite"` — see "Open detail"). Add `flex-row` for the horizontal layout RN doesn't default to.

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { cn } from "@/layout/utils/styles";
import { ChatBannerToneContext, type ChatBannerTone } from "./contexts/tone";

const toneClasses: Record<ChatBannerTone, string> = {
  info: "bg-surface-container-low text-on-surface border-outline-variant/50",
  warn: "bg-surface-container-low text-on-surface border-outline-variant/60",
  error: "bg-surface-error text-text-error border-text-error/20",
};

type ChatBannerRootProps = {
  tone?: ChatBannerTone;
  children: ReactNode;
  className?: string;
};

export function ChatBannerRoot({
  tone = "info",
  children,
  className,
}: ChatBannerRootProps) {
  return (
    <ChatBannerToneContext.Provider value={tone}>
      <View
        accessibilityLiveRegion="polite"
        className={cn(
          "w-full flex-row items-center gap-3 rounded-xl border px-3.5 py-2.5",
          toneClasses[tone],
          className,
        )}
      >
        {children}
      </View>
    </ChatBannerToneContext.Provider>
  );
}
```

> `text-*` classes in `toneClasses` are inherited by `Text`/`Typography` children in NativeWind — keep them on the container as on web.

### B3. `chat-banner-text.tsx` — `Typography` (already a primitive)

Web uses `Typography variant="body-md"` with extra classes; port directly — Typography is plan-05 RN. Keep `flex-1` and the arbitrary `text-[15px] leading-snug`.

```tsx
import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";

type ChatBannerTextProps = {
  children: ReactNode;
};

export function ChatBannerText({ children }: ChatBannerTextProps) {
  return (
    <Typography variant="body-md" className="flex-1 text-[15px] leading-snug">
      {children}
    </Typography>
  );
}
```

### B4. `chat-banner-icon.tsx` — tone-driven icon color

Web passes a `ComponentType<{ className; strokeWidth }>`. On RN the lucide icon takes `size`/`color`/`strokeWidth`, not `className`. **Change the prop component type** to the lucide-react-native icon prop shape and resolve color from tone via tokens.

```tsx
import type { ComponentType } from "react";
import { useChatBannerTone } from "./contexts/tone";

type IconProps = { size?: number; color?: string; strokeWidth?: number };

type ChatBannerIconProps = {
  icon: ComponentType<IconProps>;
};

export function ChatBannerIcon({ icon: Icon }: ChatBannerIconProps) {
  const tone = useChatBannerTone();

  return (
    <Icon
      size={16}
      strokeWidth={1.75}
      color={tone === "error" ? TEXT_ERROR : ON_SURFACE_VARIANT}
    />
  );
}
```

> `size-4 shrink-0` → `size={16}`. Consumers pass a `lucide-react-native` icon (e.g. `WifiOff`, `AlertTriangle`) whose props already match `IconProps`.

### B5. `chat-banner-action.tsx` — `<button>` → `Pressable` + `Text`

Web renders a text button with `hover:underline`. RN: `Pressable` wrapping a `Text` (Pressable can't carry text directly). Keep tone-driven color. Underline becomes static `underline` on the label (no hover) or applied on `pressed` — keep it simple and static-on-press.

```tsx
import { Pressable, Text } from "react-native";
import { cn } from "@/layout/utils/styles";
import { useChatBannerTone } from "./contexts/tone";

type ChatBannerActionProps = {
  label: string;
  onPress?: () => void;
};

export function ChatBannerAction({ label, onPress }: ChatBannerActionProps) {
  const tone = useChatBannerTone();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="shrink-0"
    >
      {({ pressed }) => (
        <Text
          className={cn(
            "text-button font-semibold",
            tone === "error" ? "text-text-error" : "text-primary",
            pressed && "underline",
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
```

> **API note:** web prop `onClick` → `onPress`. `underline-offset-2`/`hover:underline` → pressed-state `underline`.

### B6. `chat-banner-dismiss.tsx` — `<button>` → `Pressable`

```tsx
import { X } from "lucide-react-native";
import { Pressable } from "react-native";
import { cn } from "@/layout/utils/styles";

type ChatBannerDismissProps = {
  onPress?: () => void;
};

export function ChatBannerDismiss({ onPress }: ChatBannerDismissProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Dismiss"
      onPress={onPress}
      className={cn(
        "size-6 shrink-0 items-center justify-center rounded-full",
      )}
    >
      {({ pressed }) => (
        <X size={14} color={ON_SURFACE_VARIANT} />
      )}
    </Pressable>
  );
}
```

> `size-3.5`→`size={14}`. Web `hover:bg-surface-container-high` dropped (or apply on `pressed` via `cn(..., pressed && "bg-surface-container-high")` — optional). **API note:** `onClick`→`onPress`.

### B7. `index.tsx` — verbatim (compound object)

```tsx
import { ChatBannerAction } from "./chat-banner-action";
import { ChatBannerDismiss } from "./chat-banner-dismiss";
import { ChatBannerIcon } from "./chat-banner-icon";
import { ChatBannerRoot } from "./chat-banner-root";
import { ChatBannerText } from "./chat-banner-text";

export const ChatBanner = {
  Root: ChatBannerRoot,
  Icon: ChatBannerIcon,
  Text: ChatBannerText,
  Action: ChatBannerAction,
  Dismiss: ChatBannerDismiss,
};
```

---

## Part C — `brand-mark.tsx`

Single file. `<div>` → `View`, keep `BenLogo` (plan-05 RN SVG) + `Typography variant="wordmark"`. Same props (`orientation`, `logoWidth`, `logoHeight`, `className`, `itemClassName`). Add `flex-row` for the `row` case (RN columns by default), keep `flex-col` for column (default; explicit is fine).

```tsx
import { View } from "react-native";
import { cn } from "@/layout/utils/styles";
import { BenLogo } from "./icons/ben-logo";
import { Typography } from "./ui/typography";

type BrandMarkProps = {
  orientation?: "row" | "column";
  logoWidth?: number;
  logoHeight?: number;
  className?: string;
  itemClassName?: string;
};

export function BrandMark({
  orientation = "row",
  logoWidth,
  logoHeight,
  className,
  itemClassName,
}: BrandMarkProps) {
  return (
    <View
      className={cn(
        "items-center",
        orientation === "row" ? "flex-row gap-2.5" : "flex-col",
        className,
      )}
    >
      <BenLogo
        className={cn("text-primary", itemClassName)}
        width={logoWidth}
        height={logoHeight}
      />
      <Typography variant="wordmark" className={cn("text-primary", itemClassName)}>
        Ben
      </Typography>
    </View>
  );
}
```

> `BenLogo` (plan 05) is expected to accept `width`/`height` and a `className` whose `text-primary` drives `currentColor`-style fill (plan 05 point 4: "color driven by the current text color"). If plan-05's `BenLogo` instead takes a `color` prop, swap `className="text-primary"`→`color={PRIMARY}` — single-line change.

---

## Open details to resolve at implementation (do not block planning)

1. **Icon color sourcing (`ON_PRIMARY`, `ON_SURFACE_VARIANT`, `TEXT_ERROR`, `ON_SURFACE_VARIANT_60`).** `lucide-react-native` icons need a `color` string, not a Tailwind class. Two acceptable approaches, pick one consistently across all owned files at implementation:
   - **(preferred)** Read the resolved hex from the plan-03 palette and define a small local `const` per file (or inline). Values come from the migrated color tokens — confirm exact hex against plan-03 output when it lands.
   - Or, if plan-05/03 expose a NativeWind `vars()`/theme accessor or the lib supports `color="currentColor"` through a wrapping `Text` color, use that. Verify support before relying on it.
   These are the **only** values in this plan not directly portable from web class strings.
2. **`placeholderTextColor`** for `TextInput` — same sourcing as above (`on-surface-variant` @ 60%).
3. **`accessibilityRole` for the banner** — `"alert"` vs `accessibilityLiveRegion="polite"`. Chose `accessibilityLiveRegion="polite"` (Android-effective, iOS-safe) to mirror web `role="status"` semantics; adjust if a project a11y convention exists.
4. **`onClick`→`onPress` prop renames** on `ChatInput.AttachButton`, `ChatBanner.Action`, `ChatBanner.Dismiss`. This is the canonical RN contract; consuming plans (15, 24, chat/task shells) are written *after* this plan, so they bind to `onPress` from the start. No web consumer to break.
5. **Arbitrary shadow class** `shadow-[0_4px_12px_rgba(0,0,0,0.03)]` — keep; if NativeWind rejects it at build, drop (non-load-bearing).

## Verification (no formatting step)

From `project-mobile`:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Expected: passes against the plan-05 primitives, plan-03 tokens/utils, plan-07 stores, and plan-08 `use-can-record` types. Additionally confirm by inspection:

- `ChatInput`, `ChatBanner` exported as compound objects with the same part names as web; `chat-input` context value type identical.
- Typing into `ChatInput.Input` updates the draft and the action toggles Send↔Mic (`hasText`).
- `ChatInput.ActionButton` disabled conditions match web (offline / transcribing / global disabled / `!canRecord`).
- Banner tones (info/warn/error) drive container, icon, and action colors.
- `Action`/`Dismiss`/`AttachButton` `onPress` handlers fire.
- `BrandMark` renders in both `row` and `column` orientations.

## Non-goals

- No Jotai introduced here (draft state is a prop, owned by plan 10).
- No consumer wiring (plans 14/15/23/24 mount these).
- No formatting/lint step (per task instructions).
- Touch only the three owned paths.
