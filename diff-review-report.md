# Diff Review Report — Workspace Transcribing Feedback

Review of the current git diff (2 files in `project-web`) that adds a `user-pending` ("Hearing you") variant to the Task Workspace Sub-Thread Banner and wires it to the global voice-store `voiceStatus`, for voice-capture parity with the Chat screen.

Files changed:
- `project-web/src/pages/task-workspace/components/sub-thread-banner/sub-thread-banner.tsx`
- `project-web/src/pages/task-workspace/components/workspace-sub-thread-banner.tsx`

Source: `.claude/reports/diff-review-1.md`.

## What already follows the standard

- Voice state consumed via the exported `selectVoiceStatus` selector + `useVoiceStore`, exactly as Chat does — no re-derivation.
- `retryVoice` pulled with the same per-field selector style as `retry-footer.tsx`.
- Variant union and `"You"` badge match the design spec; `Typography`/`cn`/`animate-bounce`/`memo` usage is consistent.
- "Hearing you" + `label-caps text-on-surface-variant` copy matches the Chat `TranscribingFooter` verbatim.
- `tsc --noEmit` and `lint` both pass.

## Findings and recommendations

| # | Severity | Finding | Recommendation |
| --- | --- | --- | --- |
| 1 | high | `user-pending` renders "Hearing you" + dots, while the design spec renders italic transcript text. | **Skip.** Deliberate decision: project-web has no streaming transcript text (voice-store only emits the final text via `onTranscript`), so italic transcript text is impossible. "Hearing you" + dots mirrors the Chat reference (`TranscribingFooter`), which is the real product parity target. |
| 2 | medium | Variant resolved via ternary branches rather than a module-level `Record<Variant, …>` map. | **Skip.** Pre-existing local style — the existing `ben-typing`/`ben-reply`/`error` branches and the design-spec file both use this exact ternary form. Refactoring is out of scope for this task. |
| 3 | low | New dot cluster uses `gap-1`/`size-1.5`; Chat `TranscribingFooter` uses `gap-0.5`/`size-1`. | **Skip.** The new branch intentionally matches the banner's own `ben-typing` dots (`size-1.5`), which is the right internal consistency for this component. |
| 4 | medium | Voice-error copy `"Couldn't catch that — tap to retry"` matches no existing reference (Chat uses lowercase `couldn't catch that — tap to retry or type it instead`). | **Implement (recommended).** Align casing/wording to the Chat voice-error copy for genuine parity. |
| 5 | low | Voice branches sit above the `pendingDiff` guard, so `transcribing`/`error` now shows the banner even when a diff is pending (previously suppressed). | **Skip (keep as-is).** Verified: the composer stays active during `pendingDiff` (only disabled when `finished`), so the user can record while a diff is pending — showing transient "Hearing you" feedback above the diff-bar is correct, not clutter. |

## Recommended action

Implement item **#4** (align voice-error copy to the Chat reference). Skip the rest with the rationale above.
