# Process — notificacoes-correcoes

Date: 2026-10-30
Skill: simple-loop
Git: branch fix/notificacoes | commit-base 6e631f5

## Todo

- [x] Bootstrap task folder + docs + git state captured
- [x] Recon (Sonnet) — map + verdict `simples`/`complexa` + partition signal
- [x] Plan (model from the recon verdict) — clarifying questions batch
- [x] Plan — final plan.md + one ready prompt per scope
- [x] Extract block written in orquestration.md
- [x] Commit: plan
- [x] Implement (Sonnet) — one agent per scope
- [x] Lint + type-check (once, orchestrator)
- [x] Commit: implement
- [x] Validate + code-pattern review (fresh Opus)
- [x] Fix round (Sonnet) — only if CHANGES_REQUIRED
- [x] Re-validate (fresh, -r{N+1}) — only if there was a fix round
- [x] Commit: validate
- [x] Decide system test mode: `.test` only | Docker+browser only | both | skip (docs-only)
- [x] tests-01 — run + verdict.md (PASS required to finish; else fix loop)
- [x] On FAIL: plan notes → implement fix → tests-02 / tests-03 …
- [x] Commit: system-test (per attempt)
- [x] Context update (Sonnet) — task-update-project-context
- [x] Commit: context
- [x] Close + user summary

## Test attempts

| Run | Result | Notes |
|-----|--------|-------|
| tests-01 | PASS | modo .test: typecheck, lint, test na raiz exit 0 |

## Notes

- Teste final decidido pelo usuário: testes unitários novos + typecheck + lint, sem APK.
