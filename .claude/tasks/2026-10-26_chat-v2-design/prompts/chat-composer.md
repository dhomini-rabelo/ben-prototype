# Implementer — chat-composer (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — chat-composer" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-chat-composer-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-chat-composer-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-chat-composer.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.
Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract: composer (index.html:85-87; shot.png bottom)
- packages/infra/mobile/ben/src/layout/components/chat-input/chat-input-root.tsx (27-35): no longer one grey pill. The field is a row item: flex-1, h 52, rounded 26, white, border 1.5 field-border, sh-1, px 18. The action button sits OUTSIDE the field, gap 12.
- chat-input-input.tsx: 16 px, placeholder color onSurfaceVariant (from colors).
- chat-input-action-button.tsx (64-92) and packages/infra/mobile/ben/src/pages/chat/components/chat-footer/chat-footer.tsx (33-64): round button 56, bg-primary (amber), 6 px halo brand-light (wrapper View of 68 with bg brand-light, or borderWidth 6). Icon Microphone weight="fill" 26 ink; with text, ArrowUp 24 ink (send). Keep the canRecord/disabled opacity, the RecordingBar swap and the handlers.
- chat-input-attach-button.tsx: lucide→Phosphor only.
- packages/infra/mobile/ben/src/layout/strings/chat-input-strings.ts placeholder: en "Type or tap to talk", pt-BR "Digite ou toque para falar".
- packages/infra/mobile/ben/src/layout/components/recording-bar.tsx and wave-bar.tsx: lucide→Phosphor, colors to the new tokens (amber stop/send, wave color), no layout redesign.
- Footer background = background token, no band shadow. Keep the keyboard offset behaviour (pattern keyboard-aware-absolute-footer.md).
Patterns: frontend/react-components.md, mobile/keyboard-aware-absolute-footer.md, mobile/mobile-icon-colors.md.
Owned: chat-input/* (layout/components/chat-input), chat-footer.tsx, chat-input-strings.ts, recording-bar.tsx, wave-bar.tsx.
Parallel: yes, with the icons-* scopes, capture-card and mobile-voice-duration.

## Acceptance
No lucide in owned files. Typecheck shows no error in owned files. Typing turns the mic into send; tapping the mic still starts RecordingBar.
