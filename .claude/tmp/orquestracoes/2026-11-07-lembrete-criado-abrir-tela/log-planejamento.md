# Planejamento — tocar no card de lembrete no chat abre o detalhe dele; único/recorrente fica claro

Início: 2026-11-07 16:51
Pasta: .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/
Projeto: complexa, estado confirma, fixtures: sem mecanismo — projeto.md
Spec: 20 AC, 12 CB, 4 RT, 10 PR — spec.md
Parte: sem quebra
Onda: onda única
Roteiro: 63 provas (48 S + 15 T), aprovado com S41 → lane codigo — roteiro.md

## Etapas

| # | Papel | Agente | Modelo | Veredito |
|---|---|---|---|---|
| 4.1 | reconhecimento | lembrete-criado-abrir-tela-r5-recon | sonnet | complexa, estado confirma, fixtures: sem mecanismo; 6 teste/7 browser/1 codigo; 48 S + 15 T |
| 4.2 | dúvidas e roteiro | — | — | 2 dúvidas / 2 perguntadas + S41 perguntado; roteiro: 63 provas, aprovado; S41 → codigo |
| 4.3 | plano | lembrete-criado-abrir-tela-r6-plano | opus | parcial: teto no turn 25 antes de escrever; desenho em plano.md ## Parcial |
| 4.3 | plano, continuação 1 | lembrete-criado-abrir-tela-r6-plano-c1 | opus | parcial: teto no turn 21; Resumo..Fixtures escritos (24 passos / 3 cp, marco 1 = T01–T07, onda única) |
| 4.3 | plano, continuação 2 | lembrete-criado-abrir-tela-r6-plano-c2 | opus | completo: 4/4 RT, 10/10 PR, 12/12 CB, marcos: 1, onda única |
| 4.3 | revisão do plano r1 | lembrete-criado-abrir-tela-r8-revisao-plano-1 | opus | aprovado: 0 bloqueios, 9 notas |
| 4.3 | ajuste das notas | lembrete-criado-abrir-tela-r9-ajuste-notas | sonnet | 8/9 notas aplicadas (1 era só registro) |
| 4.4 | gate do plano | — | — | aprovado |

## Dúvidas técnicas (4.2)
Levantadas: sessão e dados das provas de tela; como provar a PR-009.
Perguntadas: as duas, mais o S41. Respostas: sessão misto (server local + dev.db para fluxos reais, page.route para matriz e bordas); PR-009 por predicado puro (T15); S41 na lane codigo.
Assumidas: nenhuma.

## Roteiro de comprovação (4.2)
Proposto: 63 provas — 48 screenshots, 15 casos de suíte
Ambiente: `pnpm dev` na raiz, com `BACKEND_URL=http://localhost:3333` no `.env.development` do app
Fechado: aprovado como proposto, com o S41 passado para a lane codigo
Arquivo: roteiro.md

## Gate do plano (4.4)
aprovado

## Premissas assumidas
- r6-c1: rótulo de repetição montado no app; o server manda só `reminderKind` e `recurrence` crus.
- r6-c1: alarme é sempre "Único"; goal sem repetição, sem valor ou com `weekdays` vazio também.
- r6-c1: dias na ordem segunda a domingo, abreviações em tabela própria (sem `Intl`).
- r6-c1: segundo toque rápido no card é ignorado enquanto a tela aberta pelo chat está de pé.
- r6-c1: S01–S07 e S33–S40 também rodam com server local e dados da Ana, por estabilidade.
- r6-c1: T15 ganha dois casos a mais (card de task e de nota não abrem).
- r6-c2: caminhos HTTP interceptados lidos pelo tester na primeira carga, não fixados no plano.
- O3: notas do revisor aplicadas no plano depois do `aprovado` (r9), sem nova rodada de revisão: são correções pontuais (lint do parâmetro sem uso no passo 4, "escurece" → "mais claro", linhas, alias, nome de tipo).

## Desvios da spec
- PR-007 / AC-020, S41: sai da lane browser para a lane codigo (o web não dispara alarme). Aprovado no gate 4.2.
- PR-009: teste de componente vira teste do predicado puro `isCaptureOpenable` (T15). Aprovado no gate 4.2.

## Handoffs
- 4.3, lembrete-criado-abrir-tela-r6-plano estourou a janela (124k no turn 25, só lendo); continuou lembrete-criado-abrir-tela-r6-plano-c1.
- 4.3, lembrete-criado-abrir-tela-r6-plano-c1 estourou a janela (106k no turn 21, projeção); continuou lembrete-criado-abrir-tela-r6-plano-c2, que fechou.

## Revisão do plano (4.3)
aprovado na rodada 1 (revisao-plano-1.md)

## Resultado
plano aprovado
Plano: .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/plano.md
Lanes: browser, teste, codigo
Cobertura: 4/4 RT
Provas: 63 do roteiro no plano de teste (S41 na lane codigo); acrescentadas pelo planejador: nenhuma; dispensadas: nenhuma
Checkpoints: 3
Desvios de padrão: nenhum
Fixtures: sem mecanismo
Ambiente: `pnpm dev` na raiz, com `BACKEND_URL=http://localhost:3333` no `.env.development` do app (restaurar no fim)
Estado: nenhum (preparo manual em `## Preparo do estado das provas` do plano)
Fim: 2026-11-07 17:25
