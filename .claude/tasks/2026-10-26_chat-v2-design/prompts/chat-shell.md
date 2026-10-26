# Implementer — chat-shell (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — chat-shell" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-chat-shell-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-chat-shell-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-chat-shell.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.
Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract: header + active-task strip + page layout (index.html:43-58, 94-112; shot.png top)
- packages/infra/mobile/ben/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx (14-24): h 52, px 20/16. Left: BrandMark (already v2 from theme-foundation), then a 1 px outline-variant divider and today's local date, short (en "Wed, Oct 21"; use the app language, see @/core/languages or useStrings), 13/500 on-surface-variant. Right: 44 px circular white button with sh-1 and Phosphor List 22 ink → ROUTES.menu.
- packages/infra/mobile/ben/src/pages/chat/components/active-task-peek.tsx (15-79): white card mx 16, h 54, radius 14, sh-1. Left: Kanban tile 36 (radius 10, surface-container-low, brandDeep 20). Middle: "Latest active task" 12/500 on-surface-variant over the title 15/600. Right: "{n} active" chip 13/600 on background, rounded-full, + CaretUpDown 16. Strings in chat-strings (en + pt-BR "Última tarefa ativa" / "{n} ativas").
- task-picker/active-task-picker.tsx (9-55): keep the guard (render only with active tasks) and the sheet. It now renders at the TOP.
- packages/infra/mobile/ben/src/pages/chat/page.tsx (73-138): the absolute header holds top-bar + strip; ChatTopBanner goes below the strip. Recompute headerHeight/paddingTop (84-96) so the list and empty state are not covered. Remove the picker from the footer (113). Background = background token. Keep the voice-duration wiring at 53-57 (already done by another scope).
- chat-top-banner/chat-top-banner.tsx (12-50): lucide→Phosphor + tokens.
Patterns: designs page-structure.md; frontend/react-components.md, mobile/mobile-icon-colors.md, mobile/keyboard-aware-absolute-footer.md.
Owned: chat-top-bar.tsx, active-task-peek.tsx, active-task-picker.tsx, page.tsx, chat-top-banner.tsx, the chat-strings keys you add.
Parallel: yes, with chat-messages (disjoint files; chat-strings is touched by both, so add only your own keys and do not rewrite the file).

## Acceptance
No lucide in owned files. Typecheck shows no error in owned files. Header and strip match shot.png top. With 0 active tasks the strip is gone and nothing overlaps.
