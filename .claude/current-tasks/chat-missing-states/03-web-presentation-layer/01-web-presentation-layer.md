# Plan 3 — Web Presentation Layer (banner + voice UI components)

## Context

This plan ports the **presentational** chat pieces from `project-design` into `project-web` as
self-contained, props-in components. They cover three missing chat states: the status **banner**
(permission-denied / offline / error), the **recording footer** (active mic UI), and two compact
**message footers** (transcribing "Hearing you" + error "Tap to retry").

Scope is presentation only. These components own **no** page, hook, or data files, do **no** data
fetching, and never touch `MediaRecorder`. All dynamic data (elapsed time, max time, handlers,
content) arrives via props so the parallel integration plan (Plan 4) can wire them up later.

### Files this plan owns (project-web only)

- `project-web/src/layout/components/chat-banner.tsx` (new)
- `project-web/src/pages/chat/components/recording-bar/recording-bar.tsx` (new)
- `project-web/src/pages/chat/components/message-footers/transcribing-footer.tsx` (new)
- `project-web/src/pages/chat/components/message-footers/retry-footer.tsx` (new)

It must NOT edit `page.tsx`, `use-chat.ts`, `chat-input.tsx`, `message-bubble.tsx`, `chat-shell.tsx`,
`global.css`, or any `src/api/` data-layer file. Those belong to the other parallel plans.

### Source-of-truth design files (matched exactly)

- `project-design/src/layout/components/chat-banner.tsx`
- `project-design/src/pages/app/chat-recording.tsx`
- `project-design/src/pages/app/chat-transcribing.tsx`
- `project-design/src/pages/app/chat-error.tsx`

## Decisions

1. **`cn` helper location.** project-web does NOT have `layout/utils/cn.ts` (that path only exists in
   project-design). The equivalent helper lives at
   `project-web/src/layout/utils/styles.ts` (same `extendTailwindMerge`-based `cn`). All existing
   project-web components import it from there. Our components import `cn` from
   `../../utils/styles` (banner, in `layout/components/`) and `../../../../layout/utils/styles`
   (recording-bar / message-footers, four levels deep under `pages/chat/components/...`). These exact
   relative depths match `chat-input.tsx` and `message-bubble.tsx`.

2. **`Typography` location.** `project-web/src/layout/components/ui/typography.tsx` is identical to the
   design version (same `TypographyVariant` union, same `label-caps` = `text-label-caps font-mono
   uppercase`). Reuse it directly. Banner imports from `./ui/typography`; recording-bar / footers
   import from `../../../../layout/components/ui/typography`.

3. **Tailwind tokens are already defined.** All design tokens used by the sources
   (`bg-surface-container-low`, `text-on-surface`, `text-on-surface-variant`, `border-outline-variant`,
   `bg-surface-error`, `text-text-error`, `text-primary`, `bg-primary`, `text-on-primary`,
   `bg-surface-container-lowest`, `bg-surface-container-high`, `text-label-caps`) exist in
   project-web's `global.css` `@theme` block and are already used by `chat-input.tsx` /
   `message-bubble.tsx`. No new tokens are needed, so no `global.css` edit (which this plan does not
   own anyway).

4. **Waveform animation via inline `style`.** The design recording bar animates each bar with
   `animation: pulse 0.9s ease-in-out <delay> infinite` using a per-bar staggered delay. `pulse` is
   the **built-in Tailwind v4 keyframe** (opacity 1 → .5 → 1), shipped by `@import "tailwindcss";`
   which project-web uses. So the identical inline-style animation works without any custom keyframe
   or CSS edit. The bar `height` is also set via inline style from the source's fixed `bars` array.
   We reproduce the exact `bars` array and the `${i * 60}ms` stagger verbatim for visual fidelity.

5. **Bouncing dots: mirror, do not reuse `TypingIndicator`.** `project-web/src/pages/chat/components/
   typing-indicator.tsx` already implements three `animate-bounce` dots, but it is a self-contained
   *bubble* (`rounded-2xl bg-surface-container-low px-4 py-3.5`, `size-1.5` dots) used for Ben's
   typing state — wrong size, wrong container, and wrong dot color context for an inline footer.
   The design `chat-transcribing` footer uses bare `size-1` dots with no bubble wrapper. Reusing
   `TypingIndicator` would break visual fidelity, so the transcribing footer **mirrors** the same
   `animate-bounce` + `[animation-delay:-0.2s]` / `-0.1s` pattern at the smaller `size-1` scale,
   exactly as the design source does. (Noted as a deliberate non-reuse.)

6. **Banner placement.** Ported to `layout/components/` (not `layout/components/ui/`) because it is a
   composed component (uses `Typography` + tone logic), matching the design source's own placement in
   `layout/components/chat-banner.tsx`. Single-file component per page-structure "small unique
   component" rule.

7. **Recording bar & message footers placement.** Per the page-structure skill, these are
   page-scoped chat components. The recording bar is a medium component → its own folder
   `recording-bar/recording-bar.tsx`. The two footers are grouped under
   `message-footers/` as two small unique files (`transcribing-footer.tsx`, `retry-footer.tsx`).

8. **Dismiss / cancel / retry are pure prop callbacks.** The design sources have non-functional
   buttons (static mockups). We add minimal handler props (`onDismiss`, `onCancel`, `onRetry`) so the
   integration plan can attach behavior, while keeping the components purely presentational. No
   internal state is introduced. The dismiss button only renders when `dismissible` is set (matching
   design); its `onClick` calls `onDismiss` if provided.

9. **`label-caps` line-height note.** The design recording-bar source wraps `MessageBubble` and
   `ChatShell` — those are NOT part of this plan (owned by integration). We extract only the footer
   JSX (the `<div className="flex items-center gap-3">…</div>` block) into `RecordingBar`, returning
   that root element so the integration can drop it into `ChatShell`'s `footer` slot.

10. **No `useChat`/`page.tsx` imports.** Components receive everything via props; nothing imports from
    `use-chat.ts` or other parallel-plan files.

## Existing Code to Reuse

| Symbol | Path | Use |
|---|---|---|
| `cn` | `project-web/src/layout/utils/styles.ts` | class merging (all components) |
| `Typography` | `project-web/src/layout/components/ui/typography.tsx` | labels (variant `label-caps`, `body-md`) |
| lucide icons `X`, `ArrowUp`, `Mic`, `RotateCw` | `lucide-react` (`^1.16.0`, confirmed in `project-web/package.json`) | banner dismiss, recording hint/mic, retry |
| `pulse` keyframe | Tailwind v4 built-in (via `@import "tailwindcss";` in `global.css`) | waveform bar animation |
| `animate-bounce` + `[animation-delay:-0.2s]` pattern | mirrored from `typing-indicator.tsx` / design `chat-transcribing.tsx` | transcribing footer dots |

Note: icons such as `AlertCircle` (banner icon in `chat-error`) are passed **in** by the caller via
the `icon` prop, so `ChatBanner` itself imports only `X`.

---

## Files to Create

### 1. `project-web/src/layout/components/chat-banner.tsx`

Direct port of the design source. Only changes vs. design: `cn` import path
(`../utils/cn` → `../utils/styles`), and an added optional `onDismiss` prop wired to the dismiss
button. Tone classes, structure, role, and all Tailwind classes are reproduced verbatim.

#### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `"info" \| "warn" \| "error"` | `"info"` | selects tone class map |
| `icon` | `ComponentType<{ className?: string; strokeWidth?: number }>` | — | optional leading icon (e.g. `AlertCircle`) |
| `children` | `ReactNode` | — required | banner message content |
| `action` | `{ label: string; onClick?: () => void }` | — | optional trailing text action |
| `dismissible` | `boolean` | — | shows the `X` dismiss button |
| `onDismiss` | `() => void` | — | called when dismiss button clicked |
| `className` | `string` | — | extra classes merged via `cn` |

```tsx
import { X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "../utils/styles";
import { Typography } from "./ui/typography";

type ChatBannerProps = {
  tone?: "info" | "warn" | "error";
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
  action?: { label: string; onClick?: () => void };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
};

export function ChatBanner({
  tone = "info",
  icon: Icon,
  children,
  action,
  dismissible,
  onDismiss,
  className,
}: ChatBannerProps) {
  const toneClasses = {
    info: "bg-surface-container-low text-on-surface border-outline-variant/50",
    warn: "bg-surface-container-low text-on-surface border-outline-variant/60",
    error: "bg-surface-error text-text-error border-text-error/20",
  }[tone];

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5",
        toneClasses,
        className,
      )}
      role="status"
    >
      {Icon && (
        <Icon
          className={cn(
            "size-4 shrink-0",
            tone === "error" ? "text-text-error" : "text-on-surface-variant",
          )}
          strokeWidth={1.75}
        />
      )}
      <Typography variant="body-md" className="flex-1 text-[15px] leading-snug">
        {children}
      </Typography>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            "shrink-0 text-button font-semibold underline-offset-2 hover:underline",
            tone === "error" ? "text-text-error" : "text-primary",
          )}
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
```

---

### 2. `project-web/src/pages/chat/components/recording-bar/recording-bar.tsx`

Extracts the footer JSX from the design `chat-recording.tsx` (the `flex items-center gap-3` block)
into a standalone presentational component. The static `0:07 / 0:30` timer becomes
`formatTime(elapsedSeconds)` / optional `formatTime(maxSeconds)`. The mic button gets `onCancel`
wired to its `onClick` (the active red button acts as the stop/cancel control in this footer) — and
the design's "Slide up to cancel" hint is preserved verbatim. The `bars` array and per-bar
`${i * 60}ms` stagger animation are reproduced exactly.

`formatTime` is a module-level pure helper (per coding-patterns: keep pure helpers outside the
component).

#### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `elapsedSeconds` | `number` | required | elapsed recording time; rendered as `m:ss` |
| `maxSeconds` | `number` | — | optional max; when set, renders ` / m:ss` suffix |
| `onCancel` | `() => void` | — | invoked when the red mic button is pressed |
| `className` | `string` | — | merged onto the root container |

```tsx
import { ArrowUp, Mic } from "lucide-react";
import { cn } from "../../../../layout/utils/styles";
import { Typography } from "../../../../layout/components/ui/typography";

const WAVEFORM_BARS = [
  10, 18, 28, 22, 32, 14, 26, 36, 20, 30, 16, 24, 34, 18, 28,
];

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type RecordingBarProps = {
  elapsedSeconds: number;
  maxSeconds?: number;
  onCancel?: () => void;
  className?: string;
};

export function RecordingBar({
  elapsedSeconds,
  maxSeconds,
  onCancel,
  className,
}: RecordingBarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-text-error" />
            <Typography variant="label-caps" className="text-text-error">
              Recording
            </Typography>
          </div>
          <Typography
            variant="label-caps"
            className="font-mono normal-case text-on-surface-variant"
          >
            {formatTime(elapsedSeconds)}
            {maxSeconds !== undefined && ` / ${formatTime(maxSeconds)}`}
          </Typography>
        </div>
        <div className="flex h-8 items-center justify-center gap-1">
          {WAVEFORM_BARS.map((height, index) => (
            <span
              key={index}
              className="w-1 rounded-full bg-primary/80"
              style={{
                height: `${height}px`,
                animation: `pulse 0.9s ease-in-out ${index * 60}ms infinite`,
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 text-on-surface-variant">
          <ArrowUp className="size-3.5" />
          <Typography variant="label-caps">Slide up to cancel</Typography>
        </div>
      </div>

      <button
        type="button"
        aria-label="Stop recording"
        onClick={onCancel}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-text-error text-on-primary ring-4 ring-text-error/20"
      >
        <Mic className="size-5" />
      </button>
    </div>
  );
}
```

> Fidelity note: design uses `aria-label="Recording"` on a non-interactive mock button. We keep the
> exact same classes but rename the label to `"Stop recording"` since it now has an `onClick`, and
> add `type="button"`. All visual classes (`size-12`, `bg-text-error`, `ring-4 ring-text-error/20`,
> `text-on-primary`) are unchanged.

---

### 3. `project-web/src/pages/chat/components/message-footers/transcribing-footer.tsx`

Extracted from the design `chat-transcribing.tsx` `MessageBubble` `footer` JSX: "Hearing you" label
+ three `size-1` bouncing dots + a small `X` cancel button. Compact (no bubble wrapper) so the
integration can pass it as `MessageBubble`'s `footer` prop. The `X` button is wired to `onCancel`.

#### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `onCancel` | `() => void` | — | invoked when the `X` button is pressed |
| `className` | `string` | — | merged onto the root container |

```tsx
import { X } from "lucide-react";
import { cn } from "../../../../layout/utils/styles";
import { Typography } from "../../../../layout/components/ui/typography";

type TranscribingFooterProps = {
  onCancel?: () => void;
  className?: string;
};

export function TranscribingFooter({
  onCancel,
  className,
}: TranscribingFooterProps) {
  return (
    <div className={cn("flex items-center gap-1.5 pr-2", className)}>
      <Typography variant="label-caps" className="text-on-surface-variant">
        Hearing you
      </Typography>
      <span className="flex items-center gap-0.5">
        <span className="size-1 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
        <span className="size-1 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
        <span className="size-1 animate-bounce rounded-full bg-on-surface-variant" />
      </span>
      <button
        type="button"
        aria-label="Cancel transcription"
        onClick={onCancel}
        className="ml-1 flex size-4 items-center justify-center rounded-full text-on-surface-variant hover:text-text-error"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
```

---

### 4. `project-web/src/pages/chat/components/message-footers/retry-footer.tsx`

Extracted from the design `chat-error.tsx` user-bubble `footer`: a `RotateCw` icon + "Tap to retry"
label in error tone. The whole footer is the clickable affordance (matching the design's
`<button>` wrapping both icon and label). Wired to `onRetry`.

#### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `onRetry` | `() => void` | — | invoked when the footer button is pressed |
| `className` | `string` | — | merged onto the button |

```tsx
import { RotateCw } from "lucide-react";
import { cn } from "../../../../layout/utils/styles";
import { Typography } from "../../../../layout/components/ui/typography";

type RetryFooterProps = {
  onRetry?: () => void;
  className?: string;
};

export function RetryFooter({ onRetry, className }: RetryFooterProps) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className={cn(
        "mt-1 inline-flex items-center gap-1.5 pr-2 text-text-error",
        className,
      )}
    >
      <RotateCw className="size-3.5" />
      <Typography variant="label-caps">Tap to retry</Typography>
    </button>
  );
}
```

> Fidelity note: the design uses two retry variants (`mt-1 ... pr-2` for the user bubble footer and
> `mt-2` inside a Ben bubble). We adopt the `mt-1 ... pr-2` user-footer variant as the default and
> expose `className` so integration can override the margin (e.g. `mt-2`) for the Ben-bubble case
> without a second component.

---

## Verification

Run the TypeScript compiler in project-web (no emit):

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

Expected: clean — all four files use only already-defined tokens, the existing `cn` and `Typography`
symbols, and `lucide-react` icons confirmed present in `package.json`.

Visual fidelity (waveform pulse, bouncing dots, tone colors, red mic ring) is verified later during
the Plan 4 integration step, when these components are rendered inside `ChatShell` / `MessageBubble`
with live props. This plan only guarantees the components compile and match the design source JSX
class-for-class.

## Open questions

None blocking. (Minor non-blocking choices already resolved in Decisions: dismiss/cancel/retry are
optional prop callbacks; the retry footer is a single component with a `className` override instead of
two near-identical components.)
