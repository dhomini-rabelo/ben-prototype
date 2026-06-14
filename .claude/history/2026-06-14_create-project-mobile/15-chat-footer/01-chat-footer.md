# Implementation Plan — Chat footer + input/scroll/timer hooks (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively:** `project-mobile/src/pages/chat/components/chat-footer/` and `project-mobile/src/pages/chat/hooks/{use-chat-input.ts, use-scroll-to-bottom.ts, use-elapsed-timer.ts}`.
> **Parallel-safe:** touches no file outside the footer folder + those three hook files. Runs alongside plans 12 / 13 / 14.
> **Depends on:** shared `chat-input` (plan 11), chat backbone (plan 10), UI primitives (plan 05).
> **Verification:** `npx tsc --noEmit` (no formatting step).
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port the chat footer + three supporting hooks from `project-web` to `project-mobile` (RN/Expo). The footer composes the shared `chat-input` for the text field, a **send `IconButton`**, and a **record `IconButton`** that exposes an `onStartRecording` prop left **disabled / unwired** in this unit (plan 19 supplies the recording behavior and the recording-bar swap). The three hooks: `use-chat-input` ports intact, `use-elapsed-timer` ports intact, `use-scroll-to-bottom` is re-expressed against the **inverted `FlatList`** ref (plan 12's history list) instead of a DOM node + `scrollIntoView`.

References (web):
- `project-web/src/pages/chat/components/chat-footer/chat-footer.tsx`
- `project-web/src/pages/chat/hooks/{use-chat-input.ts, use-scroll-to-bottom.ts, use-elapsed-timer.ts}`

---

## Key findings driving the plan (verified against web + dependency plans)

1. **The web footer's voice branch and the `ChatInput.ActionButton`'s voice coupling are deliberately NOT ported here.**
   - Web `chat-footer.tsx` reads `useVoiceStore` and early-returns `<RecordingBar />` when `voiceStatus === "recording"`. That recording-bar swap is **plan 19** (briefing line 24-25). This unit renders **only** input + send + placeholder record button.
   - Web `ChatInput.ActionButton` (`chat-input-action-button.tsx`) itself toggles Send/Mic and pulls `startRecording` from `useVoiceStore`, `useCanRecord()`, `useConnectivityStore`. The mobile plan-11 chat-input keeps that internal toggle, **but plan 15's footer does not use `ChatInput.ActionButton`** — the brief mandates the footer compose `chat-input` + a *separate* send `IconButton` + a *separate* record `IconButton`. So the footer uses `ChatInput.Root` + `ChatInput.Input` only, and owns the two trailing buttons itself. This keeps voice entirely out of plan 15 (the record button is inert here) and defers the voice-store wiring to plan 19.

2. **Disabled contract matches web:** the footer disables input + send while `historyState.isLoading` (web reads `useMessageListData().state.isLoading`). On mobile the canonical source is `useChatMessages().historyState` (plan 10, step 9) which already wraps `useMessageListData` and exposes `isLoading`. Use that to avoid double-subscribing to the raw data hook.

3. **Inverted-list scroll semantics (the one real rewrite — `use-scroll-to-bottom`):**
   - Plan 12 renders chat history in an **inverted `FlatList`**, data kept **newest-first internally**, presented oldest→newest visually (plan 12 briefing step 1). In an inverted list the newest item sits at the bottom and corresponds to **`offset 0`**.
   - Therefore "scroll to newest" = `listRef.current?.scrollToOffset({ offset: 0, animated: true })` — NOT `scrollToEnd` (that targets the oldest/top in an inverted list).
   - The hook creates and returns a `listRef`; plan 12's `chat-history` `FlatList` (attached at page assembly / by plan 12-16) consumes it via its `ref` prop. Plan 15 only owns the hook file; it does **not** edit `chat-history` (parallel-safety).
   - Triggers stay identical to web: re-scroll when the newest message id changes, when its streamed/animated text length grows, and when `isAwaitingReply` flips.

4. **`use-chat-input` and `use-elapsed-timer` are platform-agnostic** — they port byte-for-byte. `use-chat-input` depends on `draftAtom` (plan 10 `states/chat-state.ts`) + `useMessagesStore` (plan 10 `stores/messages-store`). `use-elapsed-timer` has zero deps.

5. **`getMessageText` / `BenUiMessage`** come from `@/pages/chat/utils/chat-messages` (plan 10, step 2) — same import path as web. `use-scroll-to-bottom` keeps consuming them.

---

## Prerequisite assumptions (delivered by plans 05 / 10 / 11 — verify, do not create)

- `@/pages/chat/states/chat-state` → `draftAtom` (plan 10).
- `@/pages/chat/stores/messages-store` → `useMessagesStore` with `sendText` / `isAwaitingReply` (plan 10).
- `@/pages/chat/utils/chat-messages` → `BenUiMessage`, `getMessageText` (plan 10).
- `@/pages/chat/hooks/use-chat-messages` → `useChatMessages()` returning `{ messages, historyState: { isLoading, isEmpty }, historyActions }` (plan 10, step 9).
- `@/layout/components/chat-input` → `ChatInput` compound object with `Root` + `Input` (plan 11). `Root` props: `{ draft, onDraftChange, onSend, disabled?, children }`.
- `@/layout/components/ui/icon-button` → `IconButton` with props `{ label, children, className?, onPress? }` (plan 05, step 2). Note: there is **no `disabled` prop** on the mobile `IconButton` per plan 05 — see Step 3 note for how the record button is rendered inert.
- `lucide-react-native` provides `Send` and `Mic` (plan 01/05 dependency). Icons take a `size`/`color` prop and/or NativeWind `className`.
- `cn` from `@/layout/utils/styles` (plan 03), if any class merge is needed.
- `jotai` (`useAtom`, `useAtomCallback`) present (plan 10 uses jotai).

If any prerequisite is absent at implementation time, **do not add it here** (out of scope / breaks parallel-safety) — note it; `tsc` will surface the gap.

---

## Step 1 — `src/pages/chat/hooks/use-chat-input.ts` (port intact)

Platform-agnostic. Copy the web file verbatim; only the import paths stay the same (`@/pages/chat/...`). No RN changes.

```ts
import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { draftAtom } from "@/pages/chat/states/chat-state";
import { useMessagesStore } from "@/pages/chat/stores/messages-store";

export function useChatInput() {
  const [draft, setDraft] = useAtom(draftAtom);
  const sendText = useMessagesStore((store) => store.sendText);

  const handleDraftChange = useCallback(
    (value: string) => setDraft(value),
    [setDraft],
  );

  const handleSend = useAtomCallback(
    useCallback(
      (get, set) => {
        const draft = get(draftAtom);
        set(draftAtom, "");
        void sendText(draft).then((committed) => {
          if (!committed) {
            set(draftAtom, draft);
          }
        });
      },
      [sendText],
    ),
  );

  return { draft, handleDraftChange, handleSend };
}
```

Rationale: the draft state model (single shared atom), the optimistic clear, the delegate-to-store send, and the restore-on-non-commit are all preserved exactly (simple-plan step 1). Jotai is RN-safe.

## Step 2 — `src/pages/chat/hooks/use-elapsed-timer.ts` (port intact)

No platform-specific code. `setInterval`/`clearInterval` exist in RN (Hermes). Copy verbatim.

```ts
import { useEffect, useState } from "react";

export function useElapsedTimer(isRunning: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((previousSeconds) => previousSeconds + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      setElapsedSeconds(0);
    };
  }, [isRunning]);

  return elapsedSeconds;
}
```

Rationale: count seconds while running, reset to 0 when stopped (simple-plan step 2). Consumed later by the recording bar / voice flow (plan 18/19); migrates as-is.

> Type note: in RN the cleanup typing is fine — `setInterval` returns a value assignable to `clearInterval`'s param. If `tsc` complains about the `NodeJS.Timeout` vs `number` ambiguity (it does not in the web copy and should not under RN lib types), annotate `const interval: ReturnType<typeof setInterval>`. Keep it un-annotated first to mirror web; only add the annotation if `tsc` flags it.

## Step 3 — `src/pages/chat/hooks/use-scroll-to-bottom.ts` (adapt to inverted FlatList)

Replace the DOM `bottomRef` + `scrollIntoView` with a **`FlatList` ref** + `scrollToOffset({ offset: 0 })` (offset 0 = newest/bottom in an inverted list). Keep the exact same trigger dependencies as web.

```ts
import { useEffect, useRef } from "react";
import type { FlatList } from "react-native";
import {
  getMessageText,
  type BenUiMessage,
} from "@/pages/chat/utils/chat-messages";

interface UseScrollToBottomProps {
  messages: BenUiMessage[];
  isAwaitingReply: boolean;
}

export function useScrollToBottom({
  messages,
  isAwaitingReply,
}: UseScrollToBottomProps) {
  const listRef = useRef<FlatList<BenUiMessage> | null>(null);

  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageLength = lastMessage ? getMessageText(lastMessage).length : 0;

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [lastMessageId, lastMessageLength, isAwaitingReply]);

  return { listRef };
}
```

Rationale & decisions:
- **`offset: 0`, not `scrollToEnd`** — load-bearing. Plan 12 keeps history newest-first internally and renders the `FlatList` `inverted`, so the newest message renders at the bottom and lives at the start of the (inverted) content = offset 0. `scrollToEnd` would jump to the oldest message. This is the core "DOM scrollIntoView → inverted list ref" rewrite (simple-plan step 3).
- **Same triggers** as web: `[lastMessageId, lastMessageLength, isAwaitingReply]`. `lastMessageLength` re-fires as `animateReply` (plan 10 step 5) grows the assistant text; `lastMessageId` fires on a new message; `isAwaitingReply` fires when the typing indicator appears. Unchanged from web.
- **Generic ref type `FlatList<BenUiMessage>`** so plan 12's `chat-history` can attach it to its `FlatList<BenUiMessage>` `ref` without a cast. The hook creates and returns `listRef`; **plan 15 does not attach it** (that `chat-history` edit is plan 12 / page-assembly 16 — kept out for parallel-safety). Exposing the ref (instead of a DOM node) satisfies simple-plan step 3's "expose a list ref the chat history can attach to."
- `FlatList` type imported `type`-only from `react-native`; `scrollToOffset` is on `FlatList`'s public instance type, so `listRef.current?.scrollToOffset(...)` type-checks.

## Step 4 — `src/pages/chat/components/chat-footer/chat-footer.tsx` (rebuild for RN)

Compose `ChatInput.Root` + `ChatInput.Input` (plan 11) for the text field, then the footer's own trailing **send** and **record** `IconButton`s. No voice branch, no `RecordingBar` (plan 19). The record button is a disabled placeholder exposing `onStartRecording`.

```tsx
import { memo } from "react";
import { Mic, Send } from "lucide-react-native";
import { View } from "react-native";
import { ChatInput } from "@/layout/components/chat-input";
import { IconButton } from "@/layout/components/ui/icon-button";
import { useChatInput } from "@/pages/chat/hooks/use-chat-input";
import { useChatMessages } from "@/pages/chat/hooks/use-chat-messages";

type ChatFooterProps = {
  onStartRecording?: () => void;
};

function ChatFooterComponent({ onStartRecording }: ChatFooterProps) {
  const { historyState } = useChatMessages();
  const { draft, handleDraftChange, handleSend } = useChatInput();

  const isDisabled = historyState.isLoading;
  const hasText = draft.trim().length > 0;

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={isDisabled}
    >
      <ChatInput.Input />
      <View className="flex-row items-center">
        {hasText ? (
          <IconButton
            label="Send"
            onPress={isDisabled ? undefined : handleSend}
            className="ml-2 bg-primary"
          >
            <Send size={20} className="text-on-primary" />
          </IconButton>
        ) : (
          <IconButton
            label="Voice input"
            onPress={undefined}
            className="ml-2 bg-primary opacity-60"
          >
            <Mic size={20} className="text-on-primary" />
          </IconButton>
        )}
      </View>
    </ChatInput.Root>
  );
}

export const ChatFooter = memo(ChatFooterComponent);
```

Rationale & decisions:
- **`onStartRecording` prop exposed but unwired.** The brief requires the record `IconButton` to *expose* an `onStartRecording` prop while staying disabled/unwired in this unit. The component accepts `onStartRecording?: () => void` so plan 19 can pass it through, but the mic button's `onPress` is **left `undefined`** and the button is visually disabled (`opacity-60`) here. Plan 19 will replace `onPress={undefined}` with `onPress={onStartRecording}` and drop the `opacity-60` (and add the recording-bar swap). Keeping the prop in the signature now means plan 19 touches only the wiring, not the component's public contract.
  - *Open decision for plan 19:* whether to keep the Send/Mic toggle in the footer or delegate to `ChatInput.ActionButton`. This plan keeps the toggle in the footer (per the brief: "send `IconButton` + a record `IconButton`"), which is why `ChatInput.ActionButton` is intentionally not rendered.
- **Send/Mic toggle on `draft`** mirrors web `ChatInput.ActionButton`: show Send when there is text, otherwise the (inert) Mic. Web used `draft.length > 0`; we use `draft.trim().length > 0` to match the store's own `trim()` send-guard (plan 10 `sendText`) so an all-whitespace draft does not show an actionable Send. (Minor parity improvement; behavior identical for normal input.)
- **`disabled` gating** matches web: input + send disabled while `historyState.isLoading`. The mobile `IconButton` (plan 05) has **no `disabled` prop**, so we express "disabled send" by setting `onPress={undefined}` (no-op press) and rely on `ChatInput.Root`'s `disabled` to dim the container; the mic placeholder gets `opacity-60` directly. (If plan 05's `IconButton` later gains a `disabled` prop, switch to it — flagged, not blocking.)
- **`ChatInput.Input` placeholder** defaults to "Message Ben..." inside plan 11's component; no override needed (web didn't override it).
- **Icon color:** lucide-react-native icons take `color`; the `text-on-primary` className relies on NativeWind SVG cssInterop (plan 05, Step 4 open-risk). To be safe and not depend on that interop here, the implementer **may** instead pass an explicit `color` resolved from the token — but since plan 11's own `ChatInput.ActionButton` uses the same className approach, keep `className="text-on-primary"` for consistency and let the shared interop decision live in plans 05/11. Flag only.
- **`memo`** preserved from web (`export const ChatFooter = memo(ChatFooterComponent)`), one component per file (memory rule), kebab-case filename, PascalCase export.
- **No `KeyboardAvoidingView` here.** Briefing: keyboard avoidance is a *consideration only*; final keyboard / safe-area placement is plan 16 (page assembly). The footer stays layout-neutral (a plain `ChatInput.Root` row) so plan 16 can wrap it.

### Folder shape

```
project-mobile/src/pages/chat/components/chat-footer/
└── chat-footer.tsx
```

Single file (matches web). No `index.ts` barrel (memory: no export-only files) — consumers import `{ ChatFooter }` from `./chat-footer` directly.

## Step 5 — Verify the unit compiles

From `project-mobile/`:

```bash
npx tsc --noEmit
```

Must pass for the four files. Type-resolution of `@/`, `jotai`, `react-native`, `lucide-react-native`, and the plan 05/10/11 modules all come from upstream plans — if `tsc` fails on those imports it is an upstream dependency gap, not this unit.

---

## Files created / modified (exhaustive — nothing outside the owned set)

```
project-mobile/src/pages/chat/
├── components/chat-footer/chat-footer.tsx   (Step 4 — rebuilt for RN)
└── hooks/
    ├── use-chat-input.ts                    (Step 1 — port intact)
    ├── use-elapsed-timer.ts                 (Step 2 — port intact)
    └── use-scroll-to-bottom.ts              (Step 3 — adapted to inverted FlatList ref)
```

## Conventions honored

- **kebab-case** files, **PascalCase** exported component, **camelCase** exported hooks (page-structure).
- **One component per file**; no barrel/index-only re-export files (memory rules).
- **No code comments** (self-explanatory code) — code-write-code skill.
- **Destructured props, function declarations, no default exports.**
- **No formatting step** (no `prettier`/`lint`) — per task instruction.

## Things explicitly NOT done in this unit (deferred / out of scope)

- **No voice / recording wiring** — the record button stays inert; `onStartRecording` is exposed but unbound (plan 19).
- **No `RecordingBar` swap / `voiceStatus` branch** (plan 18/19).
- **No edit to `chat-history`** to attach `listRef` (plan 12 / page-assembly 16).
- **No `KeyboardAvoidingView` / safe-area** placement (plan 16).
- **No use of `ChatInput.ActionButton`** (its voice coupling is bypassed; footer owns its own trailing buttons).

## Open risks to flag (not resolved here)

1. **NativeWind SVG color interop** (inherited from plan 05 open-risk): `text-on-primary` on the lucide icons paints only if `react-native-svg` cssInterop is wired. Fallback: pass an explicit `color` prop. Lives in this file / plans 05-11; does not block `tsc`.
2. **`IconButton` has no `disabled` prop** (plan 05): disabled state is expressed via `onPress={undefined}` + `opacity-60`. If plan 05 adds `disabled`, prefer it. Flagged, non-blocking.
3. **`listRef` consumer coupling**: the hook returns a `FlatList<BenUiMessage>` ref that plan 12's `chat-history` must attach. If plan 12 names its item type differently, a one-line generic alignment may be needed at integration (plan 16) — not in this unit.
