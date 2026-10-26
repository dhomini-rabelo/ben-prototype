# Implementer — finalize (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — finalize" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-finalize-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-finalize-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-finalize.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.
Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract: integration
1. Run `grep -rln lucide-react-native packages/infra/mobile/ben/{src,app}`. If anything is left (outside src/layout/utils/colors.ts comments), swap it to phosphor-react-native.
2. Rewrite the colors.ts header comment to name phosphor/react-native-svg instead of lucide.
3. Remove `lucide-react-native` from packages/infra/mobile/ben/package.json (`pnpm --filter @ben/mobile-ben remove lucide-react-native`).
4. At the root: `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`. Fix the failures in mobile-ben and domain/chat/server-ben that come from this task, minimally.
Owned: package.json, pnpm-lock.yaml, colors.ts comment, any leftover lucide file, fixes required by the root checks.
Parallel: no. Runs last.

## Acceptance
The three root commands are green. Zero lucide in mobile-ben src/app/package.json.
