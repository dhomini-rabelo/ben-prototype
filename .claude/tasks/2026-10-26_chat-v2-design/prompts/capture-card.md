# Implementer — capture-card (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — capture-card" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-capture-card-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-capture-card-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-capture-card.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.
Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract: the "Filed" card (docs/design/chat-v2/index.html:72-84, 120/126/132; shot.png)
Restyle the CaptureCard compound in packages/infra/mobile/ben/src/pages/chat/components/capture-card/*. Keep the API (Root kind/state, Icon, Body, Title, Meta, Action, ErrorButton) and the context.
- Root (28-46): white surface, radius 14, sh-1 shadow (shadow*/elevation), padding 8/14/8/8, row with gap 10, self-start, min-w 224, max-w 286. Dog-ear: a 12 px triangle at the top-right via react-native-svg (fill dog-ear over the background color, bottom-left radius 3). It must not cover the Start button.
- Icon (81-97): 30 px tile, radius 8, bg surface-container-low (#f1f0ee), Phosphor 17 px. Map `Record<CaptureKind, {Icon, color}>`: note→Note iconNote, reminder→Alarm iconReminder, task→Kanban brandDeep. Keep the muted color for finished/error states.
- Title: 15/600 (font-sans-semibold), ink, 1 line. Meta → time chip, reminder only: Clock 13 + text 12/600 brand-deep on brand-50, rounded-full, px 8. The text is `meta` (remindAt ISO) formatted with the app's existing date helper (see packages/infra/mobile/ben/src/layout/components/alarm-popup/format-clock.ts and menu-detail/reminder-editor.tsx), raw string as fallback.
- Action (13-55): Start pill 30 h, amber bg-primary, ink text 13/600 (not mono caps) + ArrowRight 14, task only. Keep the pending/active/finished labels from capture-card-strings (rename the default label to "Start" / "Começar"). Use hitSlop for a 44 px target.
- Header ("NOTE" caps): delete capture-card-header.tsx, its export, and the `<CaptureCard.Header />` line in chat-history/chat-history.tsx:64. That one line is the only edit you make in chat-history.
- ErrorButton: swap lucide→Phosphor and apply the tokens.
Patterns: frontend/react-components.md, component-variant-maps.md, minimum-props-strategies.md, mobile/mobile-icon-colors.md; design page-structure.md.
Owned: capture-card/** (+ the strings file packages/infra/mobile/ben/src/pages/chat/strings/capture-card-strings.ts, + the one line in chat-history.tsx).
Parallel: yes, with the icons-* scopes, chat-composer and mobile-voice-duration. chat-messages runs after you.

## Acceptance
No lucide in capture-card/**. `pnpm --filter @ben/mobile-ben typecheck` shows no error in owned files.
