# Prompt Insights — 2026-06-13

## Summary

- **Total prompts evaluated:** 18
- **nada (noise / one-off / pure slash):** 15
- **correction:** 2
- **skill:** 1 (aggregates a SET of 2 prompts)
- **prompt-reference:** 0

## Slash-command tally

| Command | Count |
|---|---|
| /code-get-project-context | 2 |
| /code-get-coding-designs | 1 |
| /code-write-code | 1 |
| /task-harvest-prompt-history | 1 |
| /task-update-project-context | 1 |

(Counts include occurrences inside multi-command prompts. Pure-invocation prompts: `/task-harvest-prompt-history`, `/task-update-project-context`.)

## Candidates

### 1. Validate staged changes against patterns/designs + report (delegate to sub-agent)
- **Category:** skill
- **Sources:**
  - `/home/fael/so/repos/ben-prototype/.claude/prompt-history/2026-06-13/0ae28b81-8d33-4f7d-8c13-74688bb43961/1781357580.md`
  - `/home/fael/so/repos/ben-prototype/.claude/prompt-history/2026-06-13/b5708f6e-37ea-4778-afb7-a570467b9a03/1781320480.md`
- **Summary:** Two prompts on the same day ask to validate the current staged changes against the project's coding patterns/designs and report improvements — one explicitly says "peça para um sub agente" (delegate the review to a sub-agent).
- **Recommendation:** `update-existing` — the existing `task-review-diff-standards` skill already covers reviewing the diff against standards. Add to it: (a) scope review to **staged** changes specifically, (b) instruct delegation to a **sub-agent** for the validation pass, and (c) optionally emit an improvement report (overlaps `task-create-report`). This is a SET of 2 prompts reinforcing the same workflow.
- **Suggested destination:** `.claude/skills/task-review-diff-standards`

### 2. Newly created module/service must be wired into the system
- **Category:** correction
- **Source:** `/home/fael/so/repos/ben-prototype/.claude/prompt-history/2026-06-13/8979e892-d8f6-4128-9056-af2d6ca24005/1781354949.md`
- **Summary:** User noticed the AI created a new service file (`google-auth-service.web.ts`) but never integrated it anywhere — "você apenas criou um arquivo novo".
- **Rule (wrong → right):** Wrong: create a new module/service/component file and stop. Right: after creating a new module, wire it into the system (import and use it at its call site / register it) — a new file is not "done" until something consumes it. If integration is intentionally deferred, say so explicitly.
- **Suggested destination:** `general-coding-practices.md` (add a "no orphaned modules / wire up what you create" item).

### 3. Dev/debug console logs should be gated to non-production
- **Category:** correction
- **Source:** `/home/fael/so/repos/ben-prototype/.claude/prompt-history/2026-06-13/8979e892-d8f6-4128-9056-af2d6ca24005/1781357155.md`
- **Summary:** User asked whether the mobile project's `console.warn` output could be shown only when the env is production — i.e. noisy dev warnings were leaking unconditionally.
- **Rule (wrong → right):** Wrong: emit `console.warn`/`console.log` debug output unconditionally. Right: gate development/debug console output by environment so it is suppressed in production (or only surfaces where intended). Centralize via an env check / logger rather than raw `console.*`.
- **Suggested destination:** `frontend-code-preferences.md` (or mobile-specific section of general-coding-practices.md).

## nada (filtered)

- `0ae28b81/1781357821.md` — "Aplique todas as melhorias, exceto..." follow-up to the review (one-off continuation).
- `251cf05e/1781358845.md` — pure `/task-harvest-prompt-history`.
- `8979e892/1781354520.md` — debug: `import.meta` error on web build of mobile (one-off).
- `8979e892/1781354823.md` — debug: Google sign-in PLAY_SERVICES_NOT_AVAILABLE (one-off).
- `8979e892/1781355478.md` — debug: ExpoSecureStore.setValueWithKeyAsync not a function (one-off).
- `8979e892/1781356318.md` — debug: expo web warnings / require-cycle dump (one-off).
- `ab052d09/1781358400.md` — "sim, funciona na versão web, configurei o fingerprint..." follow-up (one-off).
- `b5708f6e/1781319932.md` — "sim, funciona na versão web..." follow-up (one-off).
- `b7f420a6/1781320721.md` — debug: Google sign-in DEVELOPER_ERROR / fingerprint (one-off).
- `b7f420a6/1781321050.md` — "quanto tempo demora para propagar?" (trivial).
- `b7f420a6/1781321657.md` — debug: client_type 1 / env var question (one-off).
- `b7f420a6/1781321877.md` — debug: "login não funciona e não tem logs" (one-off).
- `b7f420a6/1781321964.md` — debug: backend login Network Error (one-off).
- `b7f420a6/1781322344.md` — debug: backend DomainError INVALID_PROVIDER_TOKEN (one-off).
- (Pure slash) `8979e892/.../task-update-project-context` invocation — see tally.

> Note: The whole day is dominated by an iterative Google OAuth / mobile-web debugging session. Each debug step is one-off and not reusable; the recurring signal is the staged-changes review workflow (candidate 1) plus the two corrections.
