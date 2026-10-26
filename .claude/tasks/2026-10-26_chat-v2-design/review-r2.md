APPROVED_WITH_RESALVAS

# Review r2 — chat-v2-design

Scope: fix1 commit `6d7b9a3` (4 mobile files + the chat-messages premissas), checked against review-r1.md. Lint/typecheck/test not re-run (green per extract).

## review-r1 items

1. Required — Start pill position: FIXED. `chat-history/chat-history-item.tsx:84-86` now renders `<CaptureCard.Action>` as the last child of `CaptureCard.Root`, after `CaptureCard.Body`. Root's inner row is `flex-row items-center gap-2.5` (capture-card-root.tsx:48), Body is `min-w-0 flex-1` (capture-card-body.tsx:9) and the button is `shrink-0` (capture-card-action-button.tsx:39), so Start sits on the right of the row, as in index.html:132. The button still returns null for non-task kinds and error state (action-button.tsx:23), so note and reminder cards are unchanged. It is the only `CaptureCard.Action` call site.
2. Note — `font-semibold` -> `font-sans-semibold`: FIXED in `voice-wave/voice-wave.tsx:49` and `day-divider/day-divider.tsx:43`. The token exists in tailwind.config.js:31.
3. Note — duplicated date options: FIXED. `day-divider.tsx:32` calls `formatShortDate(day, language)`, and the unused `LANGUAGE_LOCALES` import is gone.
4. Note — reminder more than one day away: ADDRESSED. `capture-card/capture-card-meta.tsx:20-36` now shows "tomorrow 9:00" for tomorrow, the time alone for today (`isToday` uses the same local-date `toDateString` comparison as `isTomorrow`), and "<short date>, <time>" for any other date. The implementer recorded that past dates are included. That is consistent and has no failure scenario. The invalid-ISO guard still runs first.

No regressions found in the touched files.

## Ressalvas (record, do not block)

- `pages/chat/components/suggested-action.tsx:32`: same class of issue as r1 note 2, outside fix1. The task touched this file (lucide -> phosphor) but left `font-semibold` with `text-button` (fontWeight 600, no family), so in RN the empty-state suggestion labels render in the system font instead of Instrument Sans. Use `font-sans-semibold`. Confirm in system test h/a (empty state).
- `capture-card-meta.tsx:35`: `formatShortDate` has no year, so a reminder in another calendar year shows only weekday/month/day. This is cosmetic and unlikely to come up in the prototype.
