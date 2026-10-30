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
- [ ] Implement (Sonnet) — one agent per scope
- [ ] Lint + type-check (once, orchestrator)
- [ ] Commit: implement
- [ ] Validate + code-pattern review (fresh Opus)
- [ ] Fix round (Sonnet) — only if CHANGES_REQUIRED
- [ ] Re-validate (fresh, -r{N+1}) — only if there was a fix round
- [ ] Commit: validate
- [ ] Decide system test mode: `.test` only | Docker+browser only | both | skip (docs-only)
- [ ] tests-01 — run + verdict.md (PASS required to finish; else fix loop)
- [ ] On FAIL: plan notes → implement fix → tests-02 / tests-03 …
- [ ] Commit: system-test (per attempt)
- [ ] Context update (Sonnet) — task-update-project-context
- [ ] Commit: context
- [ ] Close + user summary

## Test attempts

| Run | Result | Notes |
|-----|--------|-------|
| tests-01 | pending | |

## Notes

- Teste final decidido pelo usuário: testes unitários novos + typecheck + lint, sem APK.
