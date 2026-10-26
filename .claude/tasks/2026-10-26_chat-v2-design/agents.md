# Agents — chat-v2-design

Date: 2026-10-26
Skill: simple-loop

## Orquestrador

- O1 (opus), description orq-chat-v2-design-o1, sob o nível 0 relay (sem-nivel-0)

## Agents

| When | Role | Nonce (`description`) | Model | subagent_type | Notes |
|------|------|----------------------|-------|---------------|-------|
| 10-26 | recon | recon-chat-v2-design | sonnet | general-purpose | complexa, partição: não |
| 10-26 | planner | plan-chat-v2-design | opus | general-purpose | 4 perguntas; janela 67k t20 |
