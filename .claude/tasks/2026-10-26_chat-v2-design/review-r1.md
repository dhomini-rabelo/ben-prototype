CHANGES_REQUIRED

# Review r1 — chat-v2-design

Scope: `git diff bdc17ab..HEAD -- packages` (102 files). Lint/typecheck/test not re-run (green per extract).

## Required

1. `packages/infra/mobile/ben/src/pages/chat/components/chat-history/chat-history-item.tsx:79-89` — `<CaptureCard.Action>` is rendered INSIDE `<CaptureCard.Body>` (a `flex-col`, capture-card-body.tsx:9), so the amber Start pill stacks under the title. In the design (docs/design/chat-v2/index.html:132, `<article class="card"><div class="tile"/><div class="bd">…</div><button class="start">`) Start is a sibling of the body, on the right of the row. Correct: move `<CaptureCard.Action … />` out of `<CaptureCard.Body>` to be the last child of `<CaptureCard.Root>` (Root's inner View is already `flex-row items-center gap-2.5`, Body is `flex-1`, Action has `shrink-0`). Breaks criterion 4 / scenario d.

## Explicit checks requested

1. `capture.meta` — REFUTED. The server does populate it for reminders: `packages/domain/chat/src/application/use-cases/captures/resolve-capture.ts:55` (history, used by `server-ben/src/routes/messages/list-messages.ts:44`) and `persist-captures.ts:171` (live reply, via agent-reply-presenter) set `meta: reminder.props.remindAt` (ISO string | null); note/task get `meta: null`. chat-history-item.tsx:81 renders `CaptureCard.Meta` when meta exists, and capture-card-meta.tsx:32 limits it to reminder. The chip appears whenever the reminder has a `remindAt`. No backend change needed.
2. voiceDurationMs end to end — OK. Entity (message.ts:22) -> PersistUserMessage payload + 2 tests -> Ben message null -> Zod `int().nonnegative().nullable().optional()` (routes/chat.ts:50) -> persisted in the JSON `props` column (no migration needed; old rows read as undefined -> presenter `?? null`) -> MessagePresenter -> mobile model/request -> mapHistoryToUiMessages -> metadata -> MessageBubble/VoiceWave. Send-retry passes `metadata.voiceDurationMs` (messages-store/index.ts:66). Voice "retry" (`retryVoice`) re-records, so the duration comes from the new recording; the closure in voice-store/index.ts:60-70 carries durationMillis through the transcription. Web recorder is a no-op (durationMillis 0 -> no wave), expected.
3. Pagination / inverted / scroll-to-bottom — OK. `buildChatListItems` walks newest-first and pushes the divider after the oldest message of each day, which in an inverted list renders above that day. `onEndReached={loadOlder}` and `scrollToOffset({offset:0})` are index-independent. The divider of the oldest loaded day moves up and its count grows as older pages arrive (expected).
4. No Hanken (package.json, _layout, tailwind). No `lucide` in mobile-ben src/app/package.json (lockfile `lucide-react` belongs to the design package). No leftover CaptureCard.Header use.
5. Header — OK. page.tsx:86 applies `paddingTop: headerHeight` to the wrapper of skeleton, empty state and list; the absolute header now contains TopBar + ActiveTaskPicker + TopBanner. TaskPickerSheet is a `Modal`, so it isn't clipped by the header container.

## Notes (do not block)

- `components/voice-wave/voice-wave.tsx:49` and `components/day-divider/day-divider.tsx:233` use `font-semibold` (system font weight, no family), while the rest of this task uses `font-sans-semibold` (Instrument Sans). In RN the duration and divider will not render in Instrument Sans. Use `font-sans-semibold`.
- `components/day-divider/day-divider.tsx:218-222` copies the `toLocaleDateString` options of the new `utils/format-short-date.ts`. Call `formatShortDate(day, language)`.
- `capture-card/capture-card-meta.tsx:23-24`: a reminder more than one day away shows only the time ("9:00"), with no date. The implementer recorded this as a limit of the helper. Product limitation to record.
- `ActiveTaskPicker` used to be hidden while recording (`!isRecording`). Now it always shows, in the header. That looks intentional with the new layout. Confirm in system test g.
