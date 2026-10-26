# Implementer — icons-chat-misc (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — icons-chat-misc" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-icons-chat-misc-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-icons-chat-misc-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-icons-chat-misc.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.

Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract
Mechanical swap of lucide-react-native to phosphor-react-native in the chat files that no visual scope rewrites, keeping behaviour, size and color.
Lucide → Phosphor (phosphor-react-native; `size`/`color` props, `weight` replaces `strokeWidth`): RotateCw→ArrowClockwise, X→X, NotebookPen→NotePencil, Check→Check, Bell→Bell, Mic→Microphone, Type→TextT, Send→ArrowUp, Plus→Plus, List/Menu→List, CircleAlert/AlertCircle→WarningCircle, TriangleAlert→Warning, Wrench→Wrench, WifiOff→WifiSlash, MessageSquare→ChatCenteredText, MessageCircle→ChatCircle, ChevronUp/Down/Left/Right→CaretUp/CaretDown/CaretLeft/CaretRight, Braces→BracketsCurly, User→User, Settings→GearSix, ScrollText→Scroll, Play→Play, Minus→Minus, LogOut→SignOut, ListTodo→ListChecks, Hammer→Hammer, FileOutput→FileArrowUp, FileInput→FileArrowDown, Cpu→Cpu, Copy→Copy, ArrowUp→ArrowUp, ArrowRight→ArrowRight. Capture kinds: note→Note, reminder→Alarm, task→Kanban. If an icon is a lucide type (LucideIcon/LucideProps), use phosphor `Icon`/`IconProps`. Keep size and color; colors only from @/layout/utils/colors (pattern mobile-icon-colors.md).
Files (own exactly these 13): packages/infra/mobile/ben/src/pages/chat/components/{chat-empty-state/chat-empty-state,message-actions-menu/message-actions-menu,suggested-action,task-picker/task-picker-error,task-picker/task-picker-list,message-footers/retry-footer,message-footers/send-retry-footer,message-footers/transcribing-footer}.tsx and message-trace-sheet/{message-trace-input-step,message-trace-meta-strip,message-trace-output-step,message-trace-output,message-trace-sheet}.tsx.
Patterns: coding-patterns mobile/mobile-icon-colors.md, lint.md.
Parallel: yes, with icons-layout, icons-task-workspace, capture-card, chat-composer and mobile-voice-duration (after theme-foundation).

## Acceptance
None of the 13 files imports lucide. `pnpm --filter @ben/mobile-ben typecheck` shows no error in them.

## Premissas do implementador
- Icones com className (task-picker-error, chat-empty-state) passaram a usar color de @/layout/utils/colors (onPrimary, onSurfaceVariant) e size, pois className e ignorado em icones (mobile-icon-colors.md).
- strokeWidth removido; weight padrao do phosphor (regular) mantido.
