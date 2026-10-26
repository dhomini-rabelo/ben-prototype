# Implementer — mobile-voice-duration (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — mobile-voice-duration" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-mobile-voice-duration-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-mobile-voice-duration-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-mobile-voice-duration.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.
Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract: carry the recording duration to the API and back (mirror `transcriptionCostUsd` end to end)
Backend contract (backend-voice-duration scope): request body `voiceDurationMs?: number | null` (int ms) on the chat endpoint; every message in responses has `voiceDurationMs: number | null`.
- packages/infra/mobile/ben/src/layout/stores/voice-store/recorder.ts (50-75): `onStop(audioUri, durationMillis)`, since endRecording already returns durationMillis.
- voice-store/index.ts (39, 56) + types.ts (21-23): keep durationMillis with the pending uri, so retryVoice reuses it. Handler signature becomes `(text, costUsd, durationMillis: number | null)`. task-workspace/page.tsx:47 stays valid (fewer params).
- packages/infra/mobile/ben/src/pages/chat/page.tsx:53-57: pass `voiceDurationMs: durationMillis` in the sendText options. This is your only edit in page.tsx.
- messages-store types.ts:5, index.ts:36-39, dispatch-reply.ts:11-16, message-builders.ts (buildUserMessage puts it in the optimistic message metadata).
- packages/infra/mobile/ben/src/api/requests/chat.ts:7-12: send `voiceDurationMs` when it is a number. packages/infra/mobile/ben/src/api/models/message.ts: `voiceDurationMs?: number | null`.
- UI metadata type in packages/infra/mobile/ben/src/pages/chat/utils/chat-messages.ts + mapping in packages/infra/mobile/ben/src/pages/chat/hooks/use-chat-messages.ts: expose `metadata.voiceDurationMs`, so the bubble can read it after a reload.
Patterns: designs api-client-structure.md, page-stores-structure.md; frontend/frontend-code-preferences.md, general-code-preferences.md (propagate across layers).
Owned: exactly the files above.
Parallel: yes, with the icons-* scopes, capture-card and chat-composer (code can start now; the contract is fixed). chat-shell and chat-messages run after you.

## Acceptance
Typecheck shows no error in owned files. A voice message's optimistic UI message and its reloaded history message both carry metadata.voiceDurationMs.
