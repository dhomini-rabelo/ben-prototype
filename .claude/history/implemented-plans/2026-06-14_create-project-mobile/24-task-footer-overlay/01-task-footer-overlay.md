# Implementation Plan — Task workspace footer + done overlay (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively:** `project-mobile/src/pages/task-workspace/components/workspace-footer/` and `project-mobile/src/pages/task-workspace/components/workspace-done-overlay/`.
> **Parallel-safe:** touches no file outside those two folders. Runs alongside plans 22 / 23 / 25 / 26 (distinct component folders under `task-workspace/components/`).
> **Depends on:** task logic (plan 20), shared `chat-input` (plan 11), UI primitives (plan 05).
> **Verification:** `npx tsc --noEmit` (no formatting / lint step).
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port two task-workspace pieces from `project-web` to `project-mobile` (RN / Expo + NativeWind):

1. **`workspace-footer`** — composes the shared `ChatInput` (`Root` + `AttachButton` + `Input`) for the in-task message field, plus the footer's own trailing **send** `IconButton` and **record** `IconButton`. Sends the typed message into the open task via the **task chat logic** (`use-workspace-input`, backed by `task-chat-store`). Mirrors the web **finished-state** behavior: when the task is `finished`, input + send are disabled and the placeholder switches to "reopen to keep editing". The record button **exposes an `onStartRecording` prop** that stays **inert / unwired** in this unit; plan 27 (page assembly) wires it to `useVoiceStore.startRecording` and adds the `RecordingBar` swap.

2. **`workspace-done-overlay`** — a transient, non-interactive floating pill near the bottom of the task screen with a check icon and "nice. that one's done." The page (plan 27) mounts it conditionally when `task.status === "finished"`; this unit only builds the component.

References (web):
- `project-web/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`
- `project-web/src/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay.tsx`
- `project-web/src/pages/task-workspace/page.tsx:116-125` (how both are mounted — **context only**, not edited here).

---

## Key findings driving the plan (verified against web + dependency plans)

1. **The web footer's voice branch is NOT ported in this unit — it is plan 27's seam (exactly mirroring how plan 15 deferred it to plan 19).**
   - Web `workspace-footer.tsx` reads `useVoiceStore(selectVoiceStatus)` and early-returns `<RecordingBar />` when `voiceStatus === "recording"` (web lines 12, 16–18). That recording-bar swap + the `startRecording` wiring is **plan 27** (page assembly), per plan 24 start-briefing line 9 ("voice wiring for the task footer registers the task transcript handler at page assembly (plan 27)") and plan 27's briefing step 4 ("Wire the footer record action to begin a voice recording"). Plan 19 (`voice-chat-integration`) is **chat-only** — its owned-files table lists only `chat/components/chat-footer/chat-footer.tsx` and `chat/page.tsx`, never the workspace footer. So the task footer's voice seam belongs to plan 27, not plan 19.
   - This unit therefore renders **only** input + send + an inert placeholder record button, and **does not** read `useVoiceStore`, `useCanRecord`, or render `RecordingBar`. Doing so keeps this unit free of plan-07/17/18 dependencies and parallel-safe.

2. **The web footer uses `ChatInput.ActionButton`; this unit deliberately does NOT.** Web composes `ChatInput.Root` + `AttachButton` + `Input` + `ActionButton`, where `ChatInput.ActionButton` (web `chat-input-action-button.tsx`) internally toggles Send/Mic and pulls `startRecording` from `useVoiceStore`, plus `useCanRecord()` / `useConnectivityStore`. The mobile plan-11 `ChatInput.ActionButton` keeps that same internal voice coupling. **Mirroring plan 15's chat-footer decision**, this unit bypasses `ChatInput.ActionButton` and owns its **own** send + record `IconButton`s, so voice stays entirely out of plan 24 (record button inert; `onStartRecording` exposed but unbound). This matches plan 19's architectural note: in mobile the record-button wiring lives in the footer (here), not in the shared chat-input primitive.

3. **Finished-state disabling matches web exactly.** Web derives `isFinished = task?.status === "finished"` from `useWorkspaceTask()` and passes `disabled={isFinished}` to `ChatInput.Root`, and switches the `Input` placeholder between `"reopen to keep editing"` (finished) and `"Ask Ben to edit…"` (open). The mobile `useWorkspaceTask` (plan 20, Adjustment B) returns the same `Task | null` from `useTaskDetailData`, so `task?.status === "finished"` ports verbatim. `ChatInput.Root`'s `disabled` prop (plan 11) dims the container and gates the `Input`'s `editable`/`onSubmitEditing`.

4. **Send via task chat logic, not chat store.** Web wires the field through `useWorkspaceInput()` (web `use-workspace-input.ts`), which binds `taskDraftAtom` to `useTaskChatStore.sendText` with optimistic clear + restore-on-failure. The mobile `useWorkspaceInput` (plan 20, copy-intact) is identical. This unit consumes `useWorkspaceInput()` and `useWorkspaceTask()` from plan 20 — it creates **no** state or store logic itself.

5. **The done overlay is a pure presentational pill** — web has zero props, zero state, no interactivity (`pointer-events-none`). The only RN-specific work is the web→RN element/positioning translation (`fixed`/`dvh`/`translate-x` are web-only). The page (plan 27) decides *when* to mount it; this unit just builds it. To stay parallel-safe and avoid assuming the page's exact container/overlay strategy, the overlay renders as an **absolutely-positioned, `pointerEvents="none"` pill anchored to the bottom-center**; final stacking/`z-index`/safe-area is plan 27's concern (briefing step 5 + step 2 "respect device safe areas").

6. **`AttachButton` is included to match web.** Web `workspace-footer.tsx` renders `<ChatInput.AttachButton />` (the chat footer does NOT). Plan 11's mobile `ChatInput.AttachButton` takes an optional `onPress` and reads `disabled` from context. Web passes no handler (the button is a non-functional affordance), so we render `<ChatInput.AttachButton />` with no `onPress` — identical to web.

---

## Prerequisite assumptions (delivered by plans 05 / 11 / 20 — verify, do NOT create)

- `@/pages/task-workspace/hooks/use-workspace-input` → `useWorkspaceInput()` returning `{ draft, handleDraftChange, handleSend }` (plan 20, copy-intact).
- `@/pages/task-workspace/hooks/use-workspace-task` → `useWorkspaceTask()` returning `Task | null` (plan 20, Adjustment B).
- `@/layout/components/chat-input` → `ChatInput` compound object with `Root`, `AttachButton`, `Input` (plan 11). `Root` props: `{ draft, onDraftChange, onSend, disabled?, children, className? }`. `Input` props: `{ placeholder? }`. `AttachButton` props: `{ onPress? }` (reads `disabled` from context).
- `@/layout/components/ui/icon-button` → `IconButton` with props `{ label, children, className?, onPress? }` (plan 05, Step 2). **No `disabled` prop** on the mobile `IconButton` — see Step 1 notes for how the send/record buttons are rendered inert.
- `@/layout/components/ui/typography` → `Typography` with `{ variant, className?, children }`; `variant="body-md"` exists (plan 05, Step 3).
- `lucide-react-native` provides `Send`, `Mic`, `Check`. Icons take numeric `size` / `color` props (and may accept NativeWind `className` via cssInterop). (plan 01/05 dep set.)
- `cn` from `@/layout/utils/styles` (plan 03), for class merges.
- `react`'s `memo`; `react-native`'s `View`.

If any prerequisite is absent at implementation time, **do not add it here** (out of scope / breaks parallel-safety) — note it; `tsc` will surface the gap as an upstream dependency issue, not a defect in this unit.

---

## Web→RN substitution rules applied (consistent with plans 11 / 15 / 18)

- `<div>` → `View`; web text → `Typography`.
- Drop web-only layout/positioning that has no RN equivalent and is the page's job: `fixed`, `h-dvh`, `left-1/2 -translate-x-1/2`, `z-40`, `max-w-120`. Re-express the overlay's bottom-center anchoring with RN `absolute` + `inset`/`items-center`/`justify-end`.
- `pointer-events-none` → RN `pointerEvents="none"` prop on the outer `View` (NativeWind also maps `pointer-events-none`, but the explicit prop is the canonical RN form — use the prop).
- lucide-react-native icons: `size-4` → `size={16}`, `size-5` → `size={20}`. Color via `color` prop or `className="text-*"` (cssInterop) — keep consistent with plan 11/15 (they use `className` on the icons inside the action button; we mirror that and flag the cssInterop dependency).
- NativeWind `className` strings preserved verbatim where the utility has an RN equivalent (radius, bg, padding, gap, shadow).

---

## Step 1 — `src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`

Compose `ChatInput.Root` + `AttachButton` + `Input` (plan 11) for the field, then the footer's own trailing **send** and **record** `IconButton`s. No `useVoiceStore`, no `RecordingBar`, no `ChatInput.ActionButton`. The record button is an inert placeholder exposing `onStartRecording` (wired by plan 27).

```tsx
import { memo } from "react";
import { Mic, Send } from "lucide-react-native";
import { View } from "react-native";
import { ChatInput } from "@/layout/components/chat-input";
import { IconButton } from "@/layout/components/ui/icon-button";
import { cn } from "@/layout/utils/styles";
import { useWorkspaceInput } from "@/pages/task-workspace/hooks/use-workspace-input";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";

type WorkspaceFooterProps = {
  onStartRecording?: () => void;
};

function WorkspaceFooterComponent({ onStartRecording }: WorkspaceFooterProps) {
  const { draft, handleDraftChange, handleSend } = useWorkspaceInput();
  const task = useWorkspaceTask();

  const isFinished = task?.status === "finished";
  const hasText = draft.trim().length > 0;

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={isFinished}
    >
      <ChatInput.AttachButton />
      <ChatInput.Input
        placeholder={isFinished ? "reopen to keep editing" : "Ask Ben to edit…"}
      />
      <View className="flex-row items-center">
        {hasText ? (
          <IconButton
            label="Send"
            onPress={isFinished ? undefined : handleSend}
            className={cn("ml-2 bg-primary", isFinished && "opacity-60")}
          >
            <Send size={20} className="text-on-primary" />
          </IconButton>
        ) : (
          <IconButton
            label="Voice input"
            onPress={isFinished ? undefined : onStartRecording}
            className={cn("ml-2 bg-primary opacity-60", isFinished && "opacity-60")}
          >
            <Mic size={20} className="text-on-primary" />
          </IconButton>
        )}
      </View>
    </ChatInput.Root>
  );
}

export const WorkspaceFooter = memo(WorkspaceFooterComponent);
```

Rationale & decisions:

- **`onStartRecording` exposed but inert here.** The brief (start-briefing line 13, simple-plan step 2) requires the record `IconButton` to *expose* an `onStartRecording` prop wired at page assembly (plan 27). The component accepts `onStartRecording?: () => void`; the mic button passes it to `onPress` **but the button is rendered visually inert (`opacity-60`)** in this unit because plan 27 also supplies the `useCanRecord` gating + the `RecordingBar` swap that this unit cannot express without pulling in plan-07/17/18 deps. Threading `onStartRecording` into `onPress` now (rather than hard `undefined`) means plan 27 only has to (a) drop the `opacity-60`, (b) add the `voiceStatus === "recording"` → `<RecordingBar />` early-return, and (c) gate via `useCanRecord` — **without changing this component's public contract**. This is the exact same seam shape plan 15 left for plan 19 (compare: chat-footer left `onPress={undefined}` + `opacity-60`; here we pass the prop through but keep `opacity-60`, since the prop is already part of the contract the brief mandates). Either is acceptable; passing the prop through is the lower-friction seam for plan 27.
  - *Deferred to plan 27 (do NOT add here):* the `useVoiceStore(selectVoiceStatus)` read, the `if (voiceStatus === "recording") return <RecordingBar />;` branch, and the `useCanRecord`-based disable. These require plans 07/17/18 and would break parallel-safety + the dependency contract of this unit.

- **Send/Mic toggle on `draft`** mirrors web `ChatInput.ActionButton` (web `chat-input-action-button.tsx:18-44`): show Send when there is text, otherwise the Mic. Web used `draft.length > 0`; we use `draft.trim().length > 0` to align with `task-chat-store.sendText`'s own `trim()` send-guard (plan 20) so an all-whitespace draft does not present an actionable Send. Behavior identical for normal input (minor parity improvement, matching plan 15's same choice).

- **Finished-state disabling matches web** (web `workspace-footer.tsx:20,27,31`): `disabled={isFinished}` on `ChatInput.Root` (dims container + makes `Input` non-editable per plan 11), and the placeholder switches to `"reopen to keep editing"`. Because the mobile `IconButton` (plan 05) has **no `disabled` prop**, "disabled send/record" is expressed by `onPress={undefined}` (no-op) + an explicit `opacity-60` when `isFinished`. (If plan 05's `IconButton` later gains a `disabled` prop, switch to it — flagged, non-blocking.)

- **`AttachButton` included, no handler** — matches web (web renders `<ChatInput.AttachButton />` with no `onClick`). Plan 11's `AttachButton` reads `disabled` from `ChatInput.Root`'s context, so it auto-dims when finished; no extra wiring.

- **`ChatInput.AttachButton` / `Input` are the same parts the web footer uses** — only `ChatInput.ActionButton` is swapped for the two owned `IconButton`s (finding 2).

- **Icon color:** `className="text-on-primary"` on the lucide icons relies on NativeWind SVG cssInterop (plan 05 Step 4 / plan 11 open-risk). Kept for consistency with plan 11's `ChatInput.ActionButton` (which colors the same icons the same way) and plan 15's chat-footer. If the interop is unwired at integration, fall back to an explicit `color={ON_PRIMARY}` (hex from plan-03 palette) — single-line change, does not block `tsc`. Flag only.

- **`memo` preserved** from web (`export const WorkspaceFooter = memo(WorkspaceFooterComponent)`). One component per file (memory rule); kebab-case filename; PascalCase export.

- **No `KeyboardAvoidingView` / safe-area here.** Plan 27 (briefing step 2) wraps the footer for keyboard avoidance and safe areas. This component stays layout-neutral (a plain `ChatInput.Root` row) so plan 27 can position it — matching how plan 15 left keyboard placement to plan 16.

### Folder shape

```
project-mobile/src/pages/task-workspace/components/workspace-footer/
└── workspace-footer.tsx
```

Single file (matches web). No `index.ts` barrel (memory rule: no export-only files) — plan 27 imports `{ WorkspaceFooter }` from `./components/workspace-footer/workspace-footer` directly.

---

## Step 2 — `src/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay.tsx`

Port the floating "done" pill. Pure presentational, no props, non-interactive. Translate web `<div>` → `View`, `Check` → lucide-react-native `Check`, web text → `Typography`, and the web-only `fixed`/`dvh`/`translate-x`/`z` positioning → RN `absolute` bottom-center + `pointerEvents="none"`.

```tsx
import { Check } from "lucide-react-native";
import { View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";

export function WorkspaceDoneOverlay() {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 bottom-0 items-center justify-end pb-44"
    >
      <View className="flex-row items-center gap-2 rounded-full bg-primary/95 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <Check size={16} strokeWidth={2.25} className="text-on-primary" />
        <Typography variant="body-md" className="text-on-primary">
          nice. that one's done.
        </Typography>
      </View>
    </View>
  );
}
```

Rationale & decisions:

- **Non-interactive pill** — web sets `pointer-events-none` on the outer wrapper. RN: `pointerEvents="none"` prop on the outer `View` so the overlay never intercepts touches on the content beneath it (load-bearing — the footer/content stay tappable while the overlay shows). Preserved exactly.

- **Positioning rewrite (web → RN):** web's outer wrapper used `fixed bottom-0 left-1/2 z-40 h-dvh w-full max-w-120 -translate-x-1/2 items-end justify-center bg-on-surface/5 pb-44`. On RN:
  - `fixed` + `h-dvh` + `left-1/2 -translate-x-1/2` + `max-w-120` are web viewport/centering devices → replaced with `absolute inset-x-0 bottom-0` (the overlay spans the parent's width and pins to its bottom; the parent — plan 27's `relative`/positioned screen container — provides the bounding box and max-width, exactly as the web page's `max-w-120` wrapper did).
  - `items-end justify-center` (web: push the pill to the bottom, center horizontally) → `items-center justify-end` in RN (RN default `flex-direction: column`, so `justify-end` pushes the child to the bottom of the column and `items-center` centers it horizontally). This reproduces the web bottom-center anchor.
  - `pb-44` preserved (the gap above the footer where the pill floats).
  - **`bg-on-surface/5` (the faint full-screen scrim) is dropped.** It depended on the web wrapper covering the whole `h-dvh` viewport; with the RN `absolute bottom-0 pb-44` band (not full-screen), a scrim would only tint a thin strip and look wrong. The web scrim is decorative (5% opacity over a `pointer-events-none` layer); dropping it preserves the load-bearing element (the pill) and matches the simple-plan's description ("a floating pill that does not capture touches" — no scrim mentioned). If plan 27 wants the full-screen tint, it owns the screen container and can add it there. Flag only — non-load-bearing.
  - `z-40` is web stacking; RN stacking is render-order / `zIndex` within the parent — plan 27 controls where it mounts `<WorkspaceDoneOverlay />` in the tree (web mounts it last, after the footer — web `page.tsx:125`), so it naturally paints on top. No `z`/`zIndex` needed in this unit.

- **The pill itself ports verbatim:** `flex items-center gap-2 rounded-full bg-primary/95 px-4 py-2 text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]` → add `flex-row` (RN columns by default; web `flex` was row), keep `items-center gap-2 rounded-full bg-primary/95 px-4 py-2` and the arbitrary shadow. `text-on-primary` moves from the container onto the `Check` icon (`className`) and the `Typography` (`className`) because RN does not inherit text color from a `View` to lucide icons / `Text` the way web `currentColor` + CSS inheritance does (same cssInterop caveat as Step 1). The arbitrary `shadow-[...]` is kept; if NativeWind rejects it at build, drop (non-load-bearing) — consistent with plan 11/18's treatment of arbitrary shadows.

- **`Check` icon:** `size-4` → `size={16}`, `strokeWidth={2.25}` preserved. Color via `className="text-on-primary"` (cssInterop) for consistency with Step 1; fallback `color={ON_PRIMARY}`. Flag only.

- **`Typography variant="body-md"`** matches web exactly (web `workspace-done-overlay.tsx:9`). Text content `"nice. that one's done."` verbatim.

- **No props, no `memo`** — web has neither (it is mounted conditionally by the page, so it only renders when finished; `memo` would add no value). One component per file; kebab-case filename; PascalCase export.

### Folder shape

```
project-mobile/src/pages/task-workspace/components/workspace-done-overlay/
└── workspace-done-overlay.tsx
```

Single file (matches web). No barrel — plan 27 imports `{ WorkspaceDoneOverlay }` directly.

---

## Step 3 — Verify the unit compiles

From `project-mobile/`:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass for the two owned files. Type-resolution of `@/`, `react-native`, `lucide-react-native`, and the plan 05/11/20 modules all come from upstream plans — if `tsc` fails on those imports it is an upstream dependency gap (plans 05/11/20 unfinished), **not** this unit. Do not work around such a failure by changing import paths here.

Confirm by inspection:
- `WorkspaceFooter` accepts `onStartRecording?: () => void`, composes `ChatInput.Root` + `AttachButton` + `Input`, toggles its own Send/Mic `IconButton`s on `draft`, and disables input + send + record + switches placeholder when `task?.status === "finished"`.
- The footer reads **no** voice store and renders **no** `RecordingBar` (those are plan 27's seam).
- `WorkspaceDoneOverlay` renders a non-interactive (`pointerEvents="none"`) bottom-center pill with a `Check` + "nice. that one's done.".

---

## Files created / modified (exhaustive — nothing outside the owned set)

```
project-mobile/src/pages/task-workspace/components/
├── workspace-footer/workspace-footer.tsx              (Step 1 — rebuilt for RN)
└── workspace-done-overlay/workspace-done-overlay.tsx  (Step 2 — rebuilt for RN)
```

## Conventions honored

- **kebab-case** filenames, **PascalCase** exported components.
- **One component per file**; no barrel / index-only re-export files (memory rules).
- **No code comments** (self-explanatory code) — `code-write-code` skill.
- **Destructured props, function declarations, no default exports.**
- **No formatting / lint step** (per task instructions).
- Mirrors the chat-footer deep plan (plan 15) for consistency: footer owns its own send/record `IconButton`s, bypasses `ChatInput.ActionButton`, exposes `onStartRecording`, defers voice/RecordingBar to the page-assembly plan.

## Things explicitly NOT done in this unit (deferred / out of scope)

- **No voice / recording wiring** — record button exposes `onStartRecording` but the actual `startRecording` bind, `useCanRecord` gating, and the `voiceStatus === "recording"` → `<RecordingBar />` swap are **plan 27** (page assembly). (Web does these inline; mobile defers them, mirroring plan 15→19 for chat.)
- **No `useVoiceStore` / `selectVoiceStatus` / `useCanRecord` / `RecordingBar` import** (plans 07/17/18) — out of scope here.
- **No use of `ChatInput.ActionButton`** (its voice coupling is bypassed; the footer owns its trailing buttons).
- **No conditional mounting of `WorkspaceDoneOverlay`** — the `task.status === "finished"` gate at the mount site is plan 27 (web `page.tsx:125`).
- **No `KeyboardAvoidingView` / safe-area / screen container** — plan 27 (briefing step 2).
- **No state, store, or hook creation** — consumes plan 20's `use-workspace-input` / `use-workspace-task` only.
- **No edits outside `workspace-footer/` and `workspace-done-overlay/`** (parallel-safe vs plans 22/23/25/26).

## Open risks to flag (not resolved here)

1. **NativeWind SVG color interop** (inherited from plans 05/11): `text-on-primary` on the lucide icons (`Send`, `Mic`, `Check`) and the `Typography` paints only if `react-native-svg`/Text cssInterop is wired. Fallback: explicit `color={ON_PRIMARY}` hex (plan-03 palette). Lives in these files; does not block `tsc`.
2. **`IconButton` has no `disabled` prop** (plan 05): finished-state disable is expressed via `onPress={undefined}` + `opacity-60`. If plan 05 adds `disabled`, prefer it. Flagged, non-blocking.
3. **Done-overlay positioning depends on plan 27's screen container** providing the bounding box + max-width that the web `max-w-120` wrapper provided. The overlay uses `absolute inset-x-0 bottom-0`; if plan 27's container is not positioned/sized as expected, the pill anchor is a one-line adjustment at integration (plan 27), not in this unit. The dropped `bg-on-surface/5` scrim is plan 27's call if it wants it.
4. **`onStartRecording` seam shape:** this plan threads `onStartRecording` into the mic `onPress` while keeping the button `opacity-60` (inert visual). Plan 27 must drop `opacity-60`, add the `useCanRecord` gate, and add the `RecordingBar` swap. If plan 27 prefers the chat-footer's exact shape (`onPress={undefined}` placeholder), the prop is already in the signature either way — no contract change.
