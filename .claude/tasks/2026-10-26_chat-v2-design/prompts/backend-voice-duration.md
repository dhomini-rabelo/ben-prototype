# Implementer — backend-voice-duration (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — backend-voice-duration" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-backend-voice-duration-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-backend-voice-duration-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-backend-voice-duration.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.

Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract
Persist the duration of a voice message. New prop `voiceDurationMs: number | null` in `MessageProps` (packages/domain/chat/src/enterprise/entities/message.ts:14-23).
- `PersistUserMessageUseCase` (application/use-cases/messages/persist-user-message.ts): optional payload `voiceDurationMs?: number | null`, persisted `?? null`. Mirror how `costUsd` flows.
- `persist-ben-message.ts`: `voiceDurationMs: null`.
- Test factory application/__tests__/factories/message.ts: default null.
- Test: add behaviour cases to application/use-cases/messages/__tests__/persist-user-message.test.ts (persists the duration given; null when omitted). Follow automated-testing.md.
- HTTP: packages/infra/server-ben/src/routes/chat.ts `chatBodySchema` (35-50): `voiceDurationMs: z.number().int().nonnegative().nullable().optional()`, mirroring `transcriptionCostUsd` (49, 139), and pass it to persistUserMessageUseCase.
- Presenter src/presenters/message-presenter.ts: emit `voiceDurationMs: message.props.voiceDurationMs ?? null`. Its return type `Omit<Serialize<WithID<MessageProps>>,…>` already forces this. Also fix agent-reply-presenter.ts and packages/infra/server-ben/src/routes/tasks/create-task-message.ts if the compiler requires it.
- No Prisma migration: Message stores `props` as a JSON string (packages/infra/db/prisma/schema.prisma:12-18). Old rows lack the key, so the `?? null` matters.

Patterns: designs backend-domain-structure.md, backend-http-layer-structure.md; coding-patterns automated-testing.md, general-code-preferences.md, lint.md.
Owned: the files above (domain/chat entity, the 2 use cases, the factory, the test, server-ben chat.ts, message-presenter.ts, agent-reply-presenter.ts, create-task-message.ts only if needed).
Parallel: yes, with theme-foundation (disjoint).

## Acceptance
`pnpm --filter @ben/domain-chat test:unit` green with the new cases. `pnpm --filter @ben/domain-chat typecheck`, `pnpm --filter @ben/server-ben typecheck` and `pnpm --filter @ben/infra-db typecheck` clean (the last only if it declares the script).
