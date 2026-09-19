# Orquestração — trocar o modelo do agente Ben para gpt-5.6-luna

Pasta: .claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/

## O1 (opus) — início 12:00

| Rodada | Filhos | Modelo | Veredito |
|---|---|---|---|
| r0 | recon-codigo, recon-doc | sonnet | hoje: openrouter('openai/gpt-oss-120b') em models.ts:15; gpt-5.6-luna existe, ctx 1.05M |
| gate | pergunta ao usuario | — | seguir no OpenRouter, id openai/gpt-5.6-luna |
| r1 | planejador | opus | r1-plano.md: diff de 1 linha, slug confirmado no catalogo |
| r2 | revisor | opus | RECUSADO: strict mode da saida estruturada + provas nao rodam sem npm ci/.env |
| r3 | planejador (retomado) | opus | r3-plano-v2.md: contingencia de strict + npm ci e exit codes |
| r4 | revisor (retomado) | opus | APROVADO: compilou a linha da contingencia num scratch, sem defeito novo |
| r5 | implementador | sonnet | diff de 1 linha aplicado, lint exit=0, tsc exit=0 |
| r6 | browser tester | sonnet | BLOQUEADO pelo ambiente: sem .env e sem browser do Playwright |
| r7 | commit | sonnet | 255bd80 commitado e push com upstream novo |
| r8 | commit-da-run | sonnet | usuario pediu a pasta da run versionada; commit separado com `git add -f` |

Janela no fechamento: ~78k de 140k, 32 turns de 50. Sem handoff: a cadeia coube em um orquestrador.

## Premissas assumidas
- Manter o bloco `extraBody.provider` do OpenRouter intacto. O revisor confirmou que
  `require_parameters: true` ficou mais necessario (evita rotear para o Bedrock, que nao suporta
  `response_format`) e que `ignore: ['cerebras']` virou no-op, porque a Cerebras nao serve o luna.
  Um no-op inofensivo nao justifica escopo que o usuario nao pediu.
- Nao passar `reasoning_effort` nem nenhum parametro de geracao novo: o codigo nao passava nenhum
  antes, e o default do modelo e `medium`.
- Nao mexer em logs, apesar do nome da branch ser `feat/update-model-and-add-logs`. O usuario pediu
  so a troca do modelo e disse para nao inflar a task.
- Usar o slug `openai/gpt-5.6-luna` e nao o `canonical_slug` datado `openai/gpt-5.6-luna-20260709`,
  para nao congelar o snapshot.
- Commitar e dar push mesmo com o criterio de browser bloqueado: o bloqueio e de ambiente, nao da
  mudanca, e os dois portoes de codigo passaram.

## Handoffs
- Nenhum. Um unico orquestrador do inicio ao fim.

## Resultado
entregue com ressalvas — a prova de ponta a ponta no browser nao rodou por falta de ambiente.
