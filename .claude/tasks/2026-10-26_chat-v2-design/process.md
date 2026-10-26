# Process — chat-v2-design

Date: 2026-10-26
Skill: simple-loop (dentro da cadeia sem-nivel-0, run .claude/tmp/orquestracoes/2026-10-26-chat-v2-design/)
Git: branch feat/chat-v2-design | commit-base bdc17ab

## Todo

- [x] Bootstrap task folder + docs + git state captured
- [x] Recon (Sonnet) — map + verdict + partition signal
- [x] Plan — question batch
- [x] Plan — final plan.md + one ready prompt per scope
- [x] Extract block written in orquestration.md
- [x] Commit: plan
- [ ] Implement (Sonnet) — one agent per scope
- [ ] Lint + type-check
- [ ] Commit: implement
- [ ] Validate (fresh Opus)
- [ ] Fix round / re-validate (if CHANGES_REQUIRED)
- [ ] Commit: validate
- [x] Decide system test mode (ambos)
- [x] tests-01 — FAIL (fonte) -> fix2 c930675 -> tests-02 PASS
- [x] Context update (Sonnet)
- [x] Commit: context
- [ ] Close

## Test attempts

| Run | Result | Notes |
|-----|--------|-------|
| tests-01 | FAIL | Instrument Sans nao aplicada em bolhas/login/botoes (c,e,h,i, a,b,d,f,g cobertos); L1/L2 pre-existentes |
| tests-02 | PASS | apos fix2 (c930675); 211 testes, lint/typecheck verdes; resalvas L1, L2, 404 /tasks//detail, mic web no-op |

## Notes

- Design fonte: docs/design/chat-v2/ (index.html, plano.md, shot.png).
