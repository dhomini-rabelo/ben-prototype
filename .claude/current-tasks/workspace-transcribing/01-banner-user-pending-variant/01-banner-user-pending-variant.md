# Plan 01 — Banner `user-pending` variant (deep plan)

## Context

The Task Workspace Sub-Thread Banner (`project-web/src/pages/task-workspace/components/sub-thread-banner/sub-thread-banner.tsx`) currently supports only three variants — `ben-reply | ben-typing | error` — and always renders a hard-coded "Ben" badge. We need a new `user-pending` variant so the workspace can show "Ben is hearing the user" (transcription-in-progress) feedback, reaching voice-capture parity with the Chat screen.

In project-web there is **no streaming transcript text**: the `voice-store` goes `recording → transcribing(pending) → idle` and only emits the final text via `onTranscript`. So the `user-pending` variant must mirror the Chat reference (`project-web/src/pages/chat/components/message-footers/transcribing-footer.tsx`): a "Hearing you" label plus three bouncing dots — never live transcript text.

The project-design spec (`project-design/src/layout/components/sub-thread-banner.tsx` + `project-design/src/pages/app/workspace-transcribing.tsx`) defines the `user-pending` variant as: a **"You"** badge and **italic, muted (`text-on-surface-variant`)** content, reusing the existing banner container framing.

### Key divergence from the design reference (intentional)

The design `sub-thread-banner.tsx` renders the `user-pending` variant as **italic transcript text** inside the banner. That is a static mock with placeholder copy. The **briefing overrides this**: project-web has no transcript stream during transcription, so we render the **Chat-parity "Hearing you" + bouncing dots** treatment instead. We keep the design's badge ("You") and its muted/italic styling intent, but the body is the live transcription indicator, not text. This is the explicitly-stated requirement in `start-briefing.md` line 14 and briefing step 3.

## Decisions

1. **Extend the union, don't restructure.** Add `"user-pending"` to the existing `variant` union. Keep `ben-reply | ben-typing | error` behaving exactly as today. No variant-map refactor — the component already uses inline conditional branching consistent with the design reference, and the briefing scopes this to "only extend the union type and add the `user-pending` rendering branch."

2. **Badge text.** Today the badge is the literal `"Ben"`. Change it to render `"You"` when `variant === "user-pending"`, otherwise `"Ben"`. The badge keeps the same non-error pill styling (`bg-surface-container-high text-on-surface-variant`); `user-pending` is not an error state.

3. **Body content for `user-pending`.** Render the Chat-parity indicator: a `Typography variant="label-caps"` "Hearing you" label + three `animate-bounce` dots with staggered `[animation-delay:...]`. Match the banner's existing dot styling for `ben-typing` (`size-1.5`, `bg-on-surface-variant`) so the workspace dots are visually consistent within this component, rather than copying Chat's smaller `size-1` dots verbatim. The "Hearing you" label uses `text-on-surface-variant` (muted), satisfying the design's muted intent. No `italic` is needed because there is no transcript text to italicize — the muted label + dots is the analog. (The design's `italic` applied specifically to transcript text, which we are not rendering.)

4. **No retry / no cancel button.** The workspace banner's only action today is the `error` retry button. `user-pending` adds no button: unlike Chat's `TranscribingFooter` (which owns a cancel `X` wired to `voice-store.cancelTranscribing`), the workspace banner does not own voice state, and wiring cancel is Plan 02's concern (the consumer). Keeping `user-pending` button-free preserves the scope boundary ("Leave the surrounding screen and any consuming behavior untouched").

5. **`text` prop stays optional and unused by `user-pending`.** The variant ignores `text` entirely; callers in Plan 02 will not pass it.

6. **`isError` guard unchanged.** `user-pending` is neither error nor `ben-typing`, so it must be excluded from the existing `else` branch that renders `<Typography>{text}</Typography>`. The render condition becomes: `ben-typing` dots branch → `user-pending` "Hearing you" branch → else text branch.

## Files to Modify

### `project-web/src/pages/task-workspace/components/sub-thread-banner/sub-thread-banner.tsx`

This is the **only** file this plan touches.

**Change A — extend the union type:**

```tsx
type SubThreadBannerProps = {
  variant?: "ben-reply" | "user-pending" | "ben-typing" | "error";
  text?: string;
  onRetry?: () => void;
};
```

**Change B — badge text resolves to "You" for `user-pending`:**

Replace the hard-coded `Ben` badge content:

```tsx
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
          isError
            ? "bg-text-error/10 text-text-error"
            : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        {variant === "user-pending" ? "You" : "Ben"}
      </span>
```

**Change C — add the `user-pending` "Hearing you" + dots branch in the body:**

Replace the body conditional. Final body block:

```tsx
      <div className="min-w-0 flex-1">
        {variant === "ben-typing" ? (
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant" />
          </span>
        ) : variant === "user-pending" ? (
          <span className="inline-flex items-center gap-1.5">
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              Hearing you
            </Typography>
            <span className="flex items-center gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant" />
            </span>
          </span>
        ) : (
          <Typography
            variant="body-md"
            className={cn(
              "truncate text-[14px]",
              isError ? "text-text-error" : "text-on-surface",
            )}
          >
            {text}
          </Typography>
        )}
      </div>
```

Everything else in the file (imports, the outer `div` container classes, the `isError` retry button, the `memo` export) stays **unchanged**.

### Resulting full file (for reference)

```tsx
import { RotateCw } from "lucide-react";
import { memo } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";

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
    <div
      className={cn(
        "flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2 text-left",
        isError
          ? "border-text-error/30 bg-surface-error"
          : "border-outline-variant/40 bg-surface-container-lowest",
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
          isError
            ? "bg-text-error/10 text-text-error"
            : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        {variant === "user-pending" ? "You" : "Ben"}
      </span>
      <div className="min-w-0 flex-1">
        {variant === "ben-typing" ? (
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant" />
          </span>
        ) : variant === "user-pending" ? (
          <span className="inline-flex items-center gap-1.5">
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              Hearing you
            </Typography>
            <span className="flex items-center gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant" />
            </span>
          </span>
        ) : (
          <Typography
            variant="body-md"
            className={cn(
              "truncate text-[14px]",
              isError ? "text-text-error" : "text-on-surface",
            )}
          >
            {text}
          </Typography>
        )}
      </div>
      {isError && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1 text-label-caps font-mono uppercase text-text-error"
        >
          <RotateCw className="size-3" /> retry
        </button>
      )}
    </div>
  );
}

export const SubThreadBanner = memo(SubThreadBannerComponent);
```

## Existing Code to Reuse

- **`Typography` (`@/layout/components/ui/typography`)** — `variant="label-caps"` is already defined (verified: `text-label-caps font-mono uppercase`, rendered as `<span>`). Reused for the "Hearing you" label, matching Chat's `TranscribingFooter`.
- **`cn` (`@/layout/utils/styles`)** — already imported; no new import needed.
- **Bouncing-dots markup** — copied from this same component's existing `ben-typing` branch (`size-1.5 animate-bounce ... [animation-delay:-0.2s|-0.1s|none]`), keeping the workspace banner internally consistent.
- **"Hearing you" copy + dots concept** — from `project-web/src/pages/chat/components/message-footers/transcribing-footer.tsx`, ensuring Chat/Workspace parity.

## Contracts / Behavior Table

| `variant`       | Badge | Body                                   | Action button |
| --------------- | ----- | -------------------------------------- | ------------- |
| `ben-reply`     | Ben   | `text` (truncated, `text-on-surface`)  | none          |
| `user-pending`  | You   | "Hearing you" label + 3 bouncing dots  | none          |
| `ben-typing`    | Ben   | 3 bouncing dots                        | none          |
| `error`         | Ben   | `text` (truncated, `text-text-error`)  | retry         |

- The `variant` prop default remains `"ben-reply"`.
- `text` is ignored by `user-pending` and `ben-typing`.
- No new props are added; the component signature only widens the `variant` union.

## Impact / Scope Boundaries

- **Owned file only:** `sub-thread-banner.tsx`. Do **not** modify `workspace-sub-thread-banner.tsx` (the consumer) — that is Plan 02's job.
- **No new dependencies** on files owned by parallel plans.
- **Backward compatible:** existing variants and the badge/retry behavior are unchanged; this is a pure additive widening of the union plus one new render branch and a badge-text conditional. Current callers passing `ben-reply | ben-typing | error` are unaffected.
- **No formatting step** here (`npm run lint:fix` runs once after all parallel plans finish).

## Verification

From the project-web root, the TypeScript compiler must pass with no errors:

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

Manual/visual check (optional, after Plan 02 wires the consumer): the workspace banner in the transcribing state shows a "You" badge with a muted "Hearing you" label and three bouncing dots, matching the Chat footer's feedback.
