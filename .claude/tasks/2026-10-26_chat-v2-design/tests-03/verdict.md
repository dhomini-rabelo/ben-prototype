# Verdict tests-03 (chat-v2-design, mode ambos, nonce test-chat-v2-design-ambos-r03)

After fix3a (a650506) and fix3b (44a327c). Product code untouched by this tester. Scratchpad logs `test-chat-v2-design-ambos-r03-{lint,tc,test,dev,api3334}.log`, scripts in scratchpad `t03/`.

## Step 1: root checks
- `pnpm lint:fix` exit 0, `pnpm typecheck` exit 0, `pnpm test` exit 0: 211 passed (transcription 5, user 35, topic 28, task 42, chat 101), 0 failed.
- `git status --short` afterwards: only `?? .claude/tasks/.../tests-03/` and `?? docs/` (lint:fix changed no tracked file). Nothing committed.

## Environment
- `pnpm dev` started by me (:3333 API in-memory, :8081 Expo web). Extra API :3334 on a copy of the tests-01 seed (`t03.db`, same start command as tests-01). To the seed I added: a reminder "Renew passport" with remindAt 2027-03-05 plus its capture message pair (today), and a user/ben pair dated 2025-12-30.
- Browser: playwright-core + google-chrome headless, 390x844 @2x, JWT injected, ngrok URL routed to :3334. Mic cases use `--use-fake-device-for-media-stream` and permission microphone granted; mic-denied uses a context with no permissions.

## Fixes verified
- a) Year on chip and divider: PASS. Chip "Fri, Mar 5, 2027, 11:00 AM" (other year) shows the year; divider "Tue, Dec 30, 2025" shows it; same-year dividers "Sat, Oct 24", "Fri, Oct 23", "Mon, Oct 26" do not. No clipping (a-01-chat.png, a-02-top-last-year.png). The seeded dentist chip is relative ("tomorrow 01:56 PM"), so same-year absolute chip was verified only through the shared divider format.
- b) Task picker sheet: PASS. Tapping "2 active" opens a white (rgb 255,255,255) sheet with 24px top radius and a dark scrim over the chat; both tasks listed; tapping "Write Q3 plan" navigates to /tasks/<id> (b-01-picker-open.png, b-02-workspace-from-picker.png).
- c) `/tasks//detail`: PASS. Requests logged for both entries (picker select and Start): only `GET /tasks/<uuid>/detail`; zero 4xx/5xx responses, zero requests containing `tasks//` (b.log). Console: only shadow*/pointerEvents deprecation warnings.
- d) Web mic with fake device: PASS for client code.
  - Tap mic: RecordingBar appears with "RECORDING" label, timer counting (0:01 at 1.5s, 0:04 at 4.5s), "Slide up to cancel", Cancel and Stop buttons, amber mic (d-01, d-02).
  - Stop: "HEARING YOU ..." transcribing bubble (d-03-after-stop-2.png), `POST /transcription` with a 64045-byte multipart body (blob upload works).
  - Real provider result: server answered 500; api3334 log: `AssemblyAITranscriptionProvider.transcribe (assemblyai-transcription-provider.ts:35): language_detection cannot be performed on files with no spoken audio` (the fake device only produces a beep). Client shows the honest error bubble "couldn't catch that - tap to retry or type it instead" plus banner "mic glitched - try again or type it" (d-04-final.png). Provider rejection of non-speech audio, not a client defect.
  - Success path: no TTS available to produce speech, so I intercepted only the `/transcription` response in Playwright ({text: "MOCKED transcription hello Ben"}); everything else real. Result: voice bubble with wave + "0:04" and time, `POST /chat` carried `voiceDurationMs: 4228`, Ben replied, DB row has voiceDurationMs 4228, and the bubble keeps wave + 0:04 after reload (d-05, d-06, d-07, e-01). This path is therefore proven with a mocked provider response, not a real transcription.
  - Mic denied (no permission): chat shows banner "Ben can't hear you yet - turn on mic in device settings." below the task strip, pale mic (e-01). In the task workspace the banner (top 67 to 108 css px) sits above the list and the first todo "Book venue" starts at 145: no overlap (e-02-workspace-mic-denied.png). Fix for L2 confirmed.
- e) Regression: PASS.
  - Computed font-family audit (f.log, 167 text nodes): all Instrument Sans except the menu counts "2 active", "1", "2" in JetBrainsMono (label-caps/mono count style, allowed, as in tests-02).
  - Chat vs docs/design/chat-v2/shot.png: same layout, cream/sand bubbles, wave + duration, cards with dog-ear, amber Start, composer + amber mic; no clipping (r-01-chat.png). Menu (r-03-menu.png) and login (r-05-login.png) unchanged from tests-02, no clipping (login footer links wrapping to two lines is unchanged since tests-01).
  - Workspace spacing after the header-measure change: without banner, list starts right under the header (c-01-workspace-from-start.png, r-04-workspace.png); with banner, list starts below it (e-02). Both correct.

## Notes (not FAIL)
- Two `requestfailed` entries for `http://localhost:8081/` appeared in a.js on first load (navigation/HMR aborts); no API failure.
- Cosmetic seed artifact: two messages created in the same minute can render with Ben bubble above user bubble (same createdAt); not a product issue.
- Remaining known resalvas unchanged: suggested-action.tsx font-semibold, shadow*/pointerEvents deprecation warnings.

## Servers left running (orchestrator kills them)
- :8081 Expo web pid 630445, :3333 API pid 632782, :3334 API (seeded, t03.db) pid 635103. (`pnpm dev` parent processes also run; kill by PID.)

## Screenshots
/home/fael/so/repos/ben-prototype/.claude/tasks/2026-10-26_chat-v2-design/tests-03/screenshots/

PASS
