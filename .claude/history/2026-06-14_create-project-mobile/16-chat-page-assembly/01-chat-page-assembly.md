# Deep Plan 16 — Chat page assembly + route (project-mobile)

> **DO NOT IMPLEMENT YET.** This is a code-level implementation plan.
> **SYNC unit:** runs **alone** after the four parallel chat-component plans (12 message pipeline, 13 task picker, 14 shell bars, 15 footer) have produced their pieces, and after the backbone (10) and scaffold (01) exist. It **composes** those pieces into the page and **owns the new route file** — it must not run in parallel with 12–15 because it imports across all four ownership boundaries.

---

## 1. Context

### What this unit does

Port `project-web/src/pages/chat/page.tsx` (read in full — 88 lines) to React Native / Expo, assembling the already-built mobile chat parts into `project-mobile/src/pages/chat/page.tsx`, and register the expo-router screen at `project-mobile/app/(protected)/chat.tsx`.

The web page is a thin composition shell. Its responsibilities:

1. Read `historyState` from `useChatMessages()` (backbone, plan 10) and pick history vs. skeleton vs. empty-state.
2. Read `voiceStatus` from the voice store to (a) hide the task picker while recording and (b) decide whether a voice bubble (`transcribing`/`error`) suppresses the empty state.
3. Mount-time effects: register the transcript handler, subscribe mic permission, stop typing on unmount.
4. Layout: fixed header (top bar + banner), scrollable main, fixed footer (task picker + footer); reserve bottom padding equal to the measured footer height via `ResizeObserver`.
5. Activate connectivity tracking via `useConnectivity()`.
6. Host the menu overlay via local `isMenuOpen` state.

### Web → mobile deltas this unit must apply (from `MOBILE-PORT-ANALYSIS.md`)

| Web concern | Mobile replacement | Source |
|---|---|---|
| `ResizeObserver` on footer (`page.tsx:43-48`) | footer `onLayout` → `event.nativeEvent.layout.height` | analysis §106 "ResizeObserver → onLayout" |
| Keyboard covering the input | `KeyboardAvoidingView` wrapping footer | analysis §111 |
| Notch / home indicator | `SafeAreaView` / `useSafeAreaInsets` (`react-native-safe-area-context`, scaffolded in plan 01) | analysis §112 |
| `navigator.onLine` connectivity | `useConnectivity()` over NetInfo — same hook name/contract, NetInfo-backed (plan 14/owning plan) | analysis §113 |
| `fixed`/`max-w-120`/`-translate-x-1/2` centered column | RN flex layout (`flex-1`, absolute-positioned header/footer); the 480px max-width column is a web artifact dropped on mobile (full-width screen) | analysis §"UI" |
| `<div>/<header>/<main>/<footer>` | `View` (+ NativeWind `className`) | analysis §"UI primitives" |
| Transcript-handler registration in `page.tsx:29-33` | **REMOVED here** — explicit seam; added by plan 19 | brief §13, plan 19 §3 |

### Cross-plan boundary (what already exists when this runs)

All imported via the `@/` alias (plan 01 wired babel module-resolver + tsconfig paths). This unit **creates no component** — it only imports and composes.

| Import | Owner | Web analog |
|---|---|---|
| `useChatMessages` → `@/pages/chat/hooks/use-chat-messages` | plan 10 | `./hooks/use-chat-messages` |
| `useMessagesStore` → `@/pages/chat/stores/messages-store` (`stopTyping`) | plan 10 | `./stores/messages-store` |
| `selectVoiceStatus`, `useVoiceStore` → `@/layout/stores/voice-store` | plan 07 (global stores) | `@/layout/stores/voice-store` |
| `useConnectivity` → `@/layout/hooks/use-connectivity` (NetInfo-backed) | plan 07/14 | `@/layout/hooks/use-connectivity` |
| `ChatHistory` → `@/pages/chat/components/chat-history/chat-history` | plan 12 | same |
| `ChatHistorySkeleton` → `@/pages/chat/components/chat-history/chat-history-skeleton` | plan 12 | same |
| `ChatEmptyState` → `@/pages/chat/components/chat-empty-state/chat-empty-state` | plan 14 | same |
| `ChatTopBar` → `@/pages/chat/components/chat-top-bar/chat-top-bar` | plan 14 | same |
| `ChatTopBanner` → `@/pages/chat/components/chat-top-banner/chat-top-banner` | plan 14 | same |
| `ChatFooter` → `@/pages/chat/components/chat-footer/chat-footer` | plan 15 | same |
| `ActiveTaskPicker` → `@/pages/chat/components/task-picker/active-task-picker` | plan 13 | same |
| `MenuOverlay` → `@/layout/components/menu/menu-overlay` | plan 21/28 | `@/layout/components/menu/menu-overlay` |

> **Import-name verification rule (NO GUESSING):** the implementer must confirm each named export above against the file the owning plan actually produced before wiring it. If a parallel plan renamed/relocated a piece (e.g. `chat-history-skeleton` merged into `chat-history`, or `MenuOverlay` not yet built), this unit adapts the import to the real export — it does not invent one. The composition shape below is the target; the exact import specifiers are reconciled at implementation time against the on-disk files.

### `MenuOverlay` seam (plan 21/28)

Web mounts `<MenuOverlay onClose={...} />` driven by local `isMenuOpen`. On mobile the menu may become a native modal route (analysis §69), and plan 14 explicitly leaves `onOpenMenu` wiring to **plan 28**. To keep this unit buildable on its own without front-running plan 28:

- Keep the local `isMenuOpen` state + `onMenu` → `setIsMenuOpen(true)` wiring (the `ChatTopBar` already exposes `onOpenMenu`/`onMenu` per plan 14).
- Render `MenuOverlay` **only if it exists** on disk. If plan 21's `MenuOverlay` is present and self-contained, mount it exactly as web does. If it is not yet present when this unit is implemented, leave a clearly-marked seam comment and the `isMenuOpen` state in place so plan 28 plugs in without restructuring. Treat this exactly like the voice seam: state stays, the consumer is the seam.

> Decision (full-auto, no user prompt): **prefer mounting the existing `MenuOverlay`** to match web 1:1 if plan 21 shipped it; otherwise leave the marked seam. The owning-plan reconciliation rule above governs which branch applies.

---

## 2. Files owned by this unit

Both under `project-mobile/`, both **created** by this plan (nothing else is touched):

1. `src/pages/chat/page.tsx` — the `Chat` composition component.
2. `app/(protected)/chat.tsx` — the expo-router screen that renders `Chat`.

Conventions honored (per `page-structure`, frontend prefs, memory):
- kebab-case filenames; `Chat` stays PascalCase.
- `@/`-alias imports, never deep relative.
- No code comments **except** the two explicitly-required seam markers (voice + menu) — those are load-bearing handoff signals to plans 19/28, not explanatory noise.
- One component per file.
- No barrel/index-only files.

---

## 3. `src/pages/chat/page.tsx`

### 3.1 Layout strategy (replacing the web fixed/centered column)

Web uses `position: fixed` header/footer over a centered `max-w-120` column. On mobile:

- Outer `View` is `flex-1` with the surface background — the screen owns full width (drop the 480px cap; it is a web desktop affordance).
- **Header**: absolutely positioned at top (`absolute top-0 inset-x-0 z-50`) so the scrollable history flows under it, matching web's `fixed` header + `pt-20` main padding. It sits **inside** the `SafeAreaView` top inset so the bar clears the notch.
- **Main/history**: `flex-1`. The `ChatHistory` from plan 12 is an **inverted FlatList** that owns its own scrolling; the page passes it the top padding (header clearance) and bottom padding (footer clearance) so messages never hide under the fixed bars. Because the list is inverted, "bottom padding" for the newest message is supplied via the list's content container — see §3.4 for how the measured footer height is handed down.
- **Footer**: wrapped in `KeyboardAvoidingView`, pinned to the bottom, above the home-indicator safe-area inset.

### 3.2 Footer height via `onLayout` (replaces `ResizeObserver`)

Web measures the footer with `ResizeObserver` and feeds `footerHeight + FOOTER_GAP` into `main`'s `paddingBottom` so the last message clears the fixed footer. RN equivalent:

```tsx
const [footerHeight, setFooterHeight] = useState(0)

function handleFooterLayout(event: LayoutChangeEvent) {
  setFooterHeight(event.nativeEvent.layout.height)
}
```

- `onLayout` fires on mount and on every size change (e.g. the task picker peek appearing/disappearing, or the footer growing for multi-line input) — covering exactly the cases `ResizeObserver` did.
- `FOOTER_GAP = 16` is preserved from web (`page.tsx:15`).
- `footerHeight + FOOTER_GAP` is passed to the history list as bottom inset (§3.4), not as a `View` padding, because the inverted FlatList controls its own content insets.

### 3.3 Keyboard + safe areas

- `SafeAreaView` (from `react-native-safe-area-context`) wraps the whole screen with `edges={['top', 'bottom']}` so header clears the notch and footer clears the home indicator. `SafeAreaProvider` is already mounted at the root (`app/_layout.tsx`, plan 01 §2.10).
- `KeyboardAvoidingView` wraps **only the footer** with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` (the standard cross-platform split). This lifts the input above the keyboard without pushing the header. The history list stays put; its inverted nature keeps the newest message visible as the keyboard opens.
- `keyboardVerticalOffset` is `0` here because the footer is bottom-anchored within the safe area and there is no nav header bar above it (the screen hides the expo-router header — see §4).

> Rationale for footer-only `KeyboardAvoidingView` (vs. wrapping the whole screen): wrapping everything would also shift the absolutely-positioned header. Footer-only keeps the header fixed and only floats the input, matching the web intent (header pinned, input rises).

### 3.4 Component composition

Mirrors web `page.tsx:54-87` 1:1 in structure, swapping DOM for RN + applying the deltas. **History-state selection logic is copied verbatim** from web (`isLoading` → skeleton; `isEmpty && !hasVoiceBubble` → empty; else history):

```tsx
import { useEffect, useState } from 'react'
import { LayoutChangeEvent, Platform, View } from 'react-native'
import { KeyboardAvoidingView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChatEmptyState } from '@/pages/chat/components/chat-empty-state/chat-empty-state'
import { ChatFooter } from '@/pages/chat/components/chat-footer/chat-footer'
import { ChatHistory } from '@/pages/chat/components/chat-history/chat-history'
import { ChatHistorySkeleton } from '@/pages/chat/components/chat-history/chat-history-skeleton'
import { ChatTopBanner } from '@/pages/chat/components/chat-top-banner/chat-top-banner'
import { ChatTopBar } from '@/pages/chat/components/chat-top-bar/chat-top-bar'
import { ActiveTaskPicker } from '@/pages/chat/components/task-picker/active-task-picker'
import { useChatMessages } from '@/pages/chat/hooks/use-chat-messages'
import { useMessagesStore } from '@/pages/chat/stores/messages-store'
import { useConnectivity } from '@/layout/hooks/use-connectivity'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { MenuOverlay } from '@/layout/components/menu/menu-overlay'

const FOOTER_GAP = 16

export function Chat() {
  const { historyState } = useChatMessages()
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  useConnectivity()
  const stopTyping = useMessagesStore((store) => store.stopTyping)

  const [footerHeight, setFooterHeight] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => stopTyping, [stopTyping])

  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), [])

  // ── VOICE SEAM (plan 19) ─────────────────────────────────────────────
  // Plan 19 adds, inside this component, the transcript-handler registration:
  //   useEffect(() => {
  //     useVoiceStore.getState().setTranscriptHandler((text) => {
  //       void useMessagesStore.getState().sendText(text)
  //     })
  //   }, [])
  // Intentionally omitted here so this unit ships text-only with no dead voice
  // wiring. Do NOT add it in plan 16. Footer record button stays disabled
  // until plan 19. (Mirrors web page.tsx:29-33.)
  // ─────────────────────────────────────────────────────────────────────

  function handleFooterLayout(event: LayoutChangeEvent) {
    setFooterHeight(event.nativeEvent.layout.height)
  }

  const isRecording = voiceStatus === 'recording'
  const hasVoiceBubble =
    voiceStatus === 'transcribing' || voiceStatus === 'error'

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <View className="flex-1">
        <View className="absolute inset-x-0 top-0 z-50 bg-surface">
          <ChatTopBar onMenu={() => setIsMenuOpen(true)} />
          <ChatTopBanner />
        </View>

        <View className="flex-1">
          {historyState.isLoading ? (
            <ChatHistorySkeleton />
          ) : historyState.isEmpty && !hasVoiceBubble ? (
            <ChatEmptyState />
          ) : (
            <ChatHistory bottomInset={footerHeight + FOOTER_GAP} />
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="absolute inset-x-0 bottom-0 z-50"
        >
          <View
            onLayout={handleFooterLayout}
            className="flex-col gap-2 bg-surface px-4 pt-2 pb-2"
          >
            {!isRecording && <ActiveTaskPicker />}
            <ChatFooter />
          </View>
        </KeyboardAvoidingView>

        {/* MENU SEAM (plan 28): isMenuOpen drives MenuOverlay; if plan 21's
            MenuOverlay is not yet on disk, plan 28 wires the real trigger/route
            here. Keep isMenuOpen + onMenu intact. */}
        {isMenuOpen && <MenuOverlay onClose={() => setIsMenuOpen(false)} />}
      </View>
    </SafeAreaView>
  )
}
```

> **`ChatHistory bottomInset` prop — coordination flag with plan 12.** Web reserved footer space via `main`'s `paddingBottom`. On an inverted FlatList the equivalent is a content-container bottom inset that plan 12's `ChatHistory` must accept. Two acceptable resolutions, decided against the file plan 12 actually ships:
> 1. If plan 12's `ChatHistory` already accepts a `contentInset`/`bottomInset`-style prop → pass `footerHeight + FOOTER_GAP` to it (shown above).
> 2. If plan 12's `ChatHistory` takes no such prop → wrap the history branch in a `View` with `paddingBottom: footerHeight + FOOTER_GAP` (closest to the web `main` padding), and pass nothing to `ChatHistory`.
>
> The implementer picks the branch matching the real `ChatHistory` signature — **no guessing the prop name.** The pad value (`footerHeight + FOOTER_GAP`) and the `onLayout` source are fixed regardless of branch.

> **Header padding parity:** web added `pt-20` to `main` to clear the 64px fixed header. Here the absolute header overlaps the list top; the inverted list's newest items are at the bottom (clear of the header), and older items scroll under the translucent header exactly as on web. If plan 12's `ChatHistory` needs an explicit top inset to keep the first-visible row clear of the header, pass it the same way as `bottomInset` (top inset = header height). Reconcile against plan 12/14's actual header-height export; do not hardcode `80`/`64` if a token/constant exists.

> **`px-6` empty-state nuance (web `page.tsx:63-64`):** web widened horizontal padding to `px-6` only in the empty state. `ChatEmptyState` (plan 14) owns its own internal padding on mobile, so this page does not branch padding — confirmed by plan 14 owning the empty-state layout. Do not replicate the web `main` padding switch.

### 3.5 What is intentionally NOT in this file

- **No transcript-handler registration** (voice seam — plan 19).
- **No `ResizeObserver`, no `useLayoutEffect`, no DOM refs** (replaced by `onLayout`).
- **No `useChatScrollToBottom` wiring** — plan 15 builds the scroll hook and plan 12's `ChatHistory` consumes the list ref internally; the page does not own scroll-to-bottom (matches web, where `page.tsx` never references it).
- **No recording-bar branch** — `ChatFooter` (plan 15) already swaps to its placeholder; plan 19 activates the recording UI.

---

## 4. `app/(protected)/chat.tsx` (expo-router screen)

The route file is a thin wrapper that renders `Chat` and configures the screen. It lives under the `(protected)` route group (the auth-gated group introduced by the auth plan, plan 09 — this unit places the chat screen inside it; it does **not** own or create the group's `_layout.tsx`).

```tsx
import { Stack } from 'expo-router'
import { Chat } from '@/pages/chat/page'

export default function ChatScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Chat />
    </>
  )
}
```

- `headerShown: false` because the page renders its own `ChatTopBar`/`ChatTopBanner` (web has no native nav header). This also keeps `keyboardVerticalOffset={0}` correct (§3.3).
- Default export named `ChatScreen` (expo-router requires a default export per route file). `Chat` stays the named feature component in `page.tsx` — matching the web `Chat` export and keeping the route file a pure adapter.
- The URL is `/chat`, matching `ROUTES.chat` (plan 01 §2.14). Route-group folders `(protected)` are path-transparent in expo-router, so `app/(protected)/chat.tsx` still resolves to `/chat` — consistent with the existing route map; no change to `routes.ts` needed.

> **`(protected)` group existence flag:** if the auth plan (09) created the protected group with a different name (e.g. `(app)` / `(auth)`), place `chat.tsx` in whatever auth-gated group exists on disk and ensure the resulting path stays `/chat`. Do not invent a second group. If no protected group exists yet when this unit lands, place the file at `app/chat.tsx` and leave a one-line seam note that plan 28/09 relocates it into the group — the screen renders identically either way.

---

## 5. Things to verify against sibling plans before wiring (reconciliation checklist)

Because this is a sync unit composing four parallel outputs, the implementer must, **before writing imports**, confirm each against the on-disk file the owning plan produced:

1. `ChatTopBar` prop name for the menu trigger — web uses `onMenu`; plan 14's brief says `onOpenMenu`. Use whatever plan 14 actually exported.
2. `ChatHistory` inset prop (§3.4 branch selection).
3. `ChatHistory` top-inset need (§3.4 header note).
4. `ChatHistorySkeleton` export location (standalone file vs. re-exported from `chat-history`).
5. `ActiveTaskPicker` export name/path (plan 13).
6. `MenuOverlay` existence (§1 menu seam) and `(protected)` group name (§4).
7. `useConnectivity` export from `@/layout/hooks/use-connectivity` (NetInfo-backed) exists with a no-arg call signature (matches web).

None of these change the composition shape — they only pin the exact specifiers. Where a sibling diverges, adapt the import; never redefine the component here.

---

## 6. Verification

From `project-mobile/`:

```bash
npx tsc --noEmit
```

Must pass with zero errors. This exercises: the `@/` alias resolution to all 11 imported pieces, NativeWind `className` typing on RN `View`/`SafeAreaView`/`KeyboardAvoidingView`, the `LayoutChangeEvent` type, and the route file's default export.

**No formatting step** (no `prettier`/`lint:fix`) — per task instruction.

Functional expectation (manual, not gated by tsc): chat screen renders end-to-end — header (bar + banner), history in each state (skeleton / empty / populated), task picker peek, and footer with text input; **sending a text message works**; **voice is intentionally not yet wired** (record button disabled until plan 19).

> If `tsc` fails on any imported piece, the failure is an **upstream gap** in plans 10/12–15/07/21 (a piece not yet built or a renamed export), not in this unit — reconcile per §5, do not stub the missing piece here.

---

## 7. Out of scope (owned by other plans)

- All chat sub-components (plans 12–15), the backbone stores/hooks (plan 10), the voice store (plan 07), `useConnectivity`/NetInfo (plan 07/14), `MenuOverlay` (plan 21), UI primitives + tokens (plans 03/05).
- **Voice transcript-handler registration** (plan 19) — left as the marked seam in §3.4.
- **Menu trigger/route wiring** (plan 28) — left as the marked seam in §3.4/§4.
- The `(protected)` group `_layout.tsx` and auth gating (plan 09).
- `src/core/routes.ts` (already provides `ROUTES.chat`, plan 01).
- Scroll-to-bottom hook/list ref plumbing (plan 15 + plan 12 internal).
