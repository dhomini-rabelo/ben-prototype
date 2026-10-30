# Agents — notificacoes-correcoes

Date: 2026-10-30
Skill: simple-loop

## Level 0 — Orchestrator

- Role: orquestrador O1 da cadeia sem-nivel-0 (sessão do project-manager)
- Model: (session default)
- Agent id: n/a
- Context budget: no code, no plan, no diffs, no verdicts — pointers and verdicts only

## Agents

| When | Role | Nonce (`description`) | Agent id | Model | subagent_type | janela | Notes |
|------|------|----------------------|----------|-------|---------------|--------|-------|
| 2026-10-30 | recon | achar-chat-notificacoes-r3-recon | n/a | sonnet | general-purpose | n/a | veredito: ver recon.md |

## Ledger (what level 0 keeps in context — ≤5 lines per stage)

```text
recon | achar-chat-notificacoes-r3-recon | veredito: (ver recon.md) | partição: (ver recon.md)
```

## Reuse decisions

| Chain | Reused? | Why |
|---|---|---|
| planner → answers → plan notes | yes/no | window ≤80k, turns ≤25 and same scope |
| implementer → fix round | yes/no | window ≤80k, turns ≤25 and same scope |
| validator per round | **never** | one that already approved arrives anchored |
| tester per attempt | **never** | handoff channel is verdict.md |
