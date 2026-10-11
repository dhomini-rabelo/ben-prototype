# Process — language-switch

Date: 2026-10-11
Skill: simple-loop
Git: branch feat/add-version-in-settings | commit-base 3ec6712

Pedido: feature de trocar idioma — inglês (default) e português BR. Usuário pediu execução 100% autônoma, sem perguntas.

## Todo

- [x] Bootstrap task folder + docs + git state captured
- [x] Recon (Sonnet) — map + verdict `simples`/`complexa` + partition signal
- [x] Plan (model from the recon verdict) — sem perguntas ao usuário: dúvidas viram "Premissas assumidas"
- [x] Plan — final plan.md + one ready prompt per scope
- [x] Extract block written in orquestration.md
- [x] Commit: plan
- [x] Implement (Sonnet) — one agent per scope
- [x] Lint + type-check
- [x] Commit: implement
- [x] Validate + code-pattern review (fresh Opus)
- [x] Fix round (Sonnet) — only if CHANGES_REQUIRED
- [x] Re-validate — only if there was a fix round
- [x] Commit: validate
- [x] Decide system test mode
- [x] tests-01 — run + verdict.md
- [ ] Commit: system-test (per attempt)
- [ ] Context update (Sonnet)
- [ ] Commit: context
- [ ] Close + user summary

## Test attempts

| Run | Result | Notes |
|-----|--------|-------|
| tests-01 | PASS | 7 casos; bug plural pt-BR no trace meta → fix + tests-02 |

## Notes

- Sem perguntas ao usuário (instrução explícita); o planner decide e registra premissas.
