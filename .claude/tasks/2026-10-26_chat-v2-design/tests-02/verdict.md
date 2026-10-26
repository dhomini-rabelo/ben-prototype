# Verdict tests-02 (chat-v2-design, mode ambos, nonce test-chat-v2-design-ambos-r02)

After fix2 (c930675, font-family). Product code untouched by this tester.

## Step 1: root checks (logs in scratchpad `test-chat-v2-design-ambos-r02-{lint,tc,test}.log`)
- `pnpm lint:fix`: exit 0. `pnpm typecheck`: exit 0 (all packages Done). `pnpm test`: exit 0, 211 passed (transcription 5, user 35, topic 28, task 42, chat 101), 0 failed.
- `git status --short` after lint:fix: only `?? .claude/tasks/2026-10-26_chat-v2-design/tests-01/`, `?? .../tests-02/`, `?? docs/` (lint:fix modified no tracked file). Nothing committed.

## Step 2: computed font-family (browser 390x844, playwright-core + google-chrome; script t02/f.js, output t02/f.log in scratchpad)
Env: Expo :8081 reloaded with fix2; API :3334 (seeded sqlite from tests-01) was up; login screen used no-auth context, the others the injected JWT.
- Login: "Ben" wordmark InstrumentSans_700Bold; tagline InstrumentSans_400Regular; "Continue with Google" InstrumentSans_600SemiBold; copyright and Privacy/Terms/Help InstrumentSans.
- Chat: header "Ben" 700Bold, date 500Medium, task strip label 500Medium / title and "2 active" 600SemiBold, banner text 400Regular, user and Ben message bodies 400Regular, bubble times 400Regular, wave duration 0:04/0:07/0:09 600SemiBold, card titles 600SemiBold, Start 600SemiBold, day dividers "Today · 3 filed" and "Yesterday" 600SemiBold, composer input (placeholder "Type or tap to talk") 400Regular. 100% of text nodes are Instrument Sans (these were the system stack in tests-01).
- Menu: "Ben", Tasks, Notes, Reminders, Settings InstrumentSans_600SemiBold/700Bold. Only the three counts ("2 active", "1", "1") are JetBrainsMono_400Regular (label-caps/mono count style): allowed by the task rule, and not a defect.
- Task workspace: title, todo items, "add item" and "Ask Ben to edit…" inputs, banner: InstrumentSans_*.
- No Text outside Instrument Sans except the menu counts above.

## Visual comparison
- a-01-chat.png vs docs/design/chat-v2/shot.png: bubble text now in Instrument Sans at the same look and weight as the mock (cream user bubbles, sand Ben bubbles, wave + bold amber-brown duration + grey time, cards with dog-ear and tile icon, amber Start, composer + amber mic). Differences are data-only (seed content, no card preview text, mic pale because web forces mic denied, mic-denied banner) and are known.
- Versus tests-01 a-01-chat-initial.png: same layout, same wrapping, no clipping or overlap; text glyphs now match the mock (previously Arial/system). Login: same layout as tests-01 h-03-login (footer links wrap to two lines in both, unchanged), only the font changed. Menu and workspace: no clipping.
- Screenshots: /home/fael/so/repos/ben-prototype/.claude/tasks/2026-10-26_chat-v2-design/tests-02/screenshots/ (a-01-chat.png, f-01-typing.png, h-01-menu.png, h-02-workspace.png, h-03-login.png).

## Carried over from tests-01 (not re-run; fix2 touched only font classes, no logic)
a, b, c, d, e, f, g (reachable states), i, criteria 2 and 3: PASS before; fix2 diff (typography.tsx, button.tsx, message-bubble.tsx, chat-input, menu components) changes className font families only.

## Known resalvas (not FAIL)
L1 task-picker-sheet className on web (pre-existing), L2 workspace banner overlaps first todo when mic denied (pre-existing; in h-02 the banner sits above the list with no overlap on this run), `GET /tasks//detail` 404 (one 404 resource error still logged on entering the workspace), web mic no-op (recording bar / transcribing / voice error not reachable), suggested-action.tsx font-semibold, reminder chip without year. Console warnings: shadow* and props.pointerEvents deprecations.

PASS
