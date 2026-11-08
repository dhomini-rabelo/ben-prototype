# Planejamento — tela de alarme em tela cheia com som para lembretes de horário do Ben (Android)

Início: 2026-11-07 16:48
Pasta: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
Projeto: mobile-ben + domain-chat + server-ben — projeto.md
Spec: 16 AC, 13 CB, 13 RT, 8 PR — spec.md
Parte: sem quebra
Onda: onda única
Roteiro: 37 provas: 18 screenshots, 19 casos de suíte — roteiro.md

## Etapas

| # | Papel | Agente | Modelo | Veredito |
|---|---|---|---|---|
| 4.1 | reconhecimento | alarme-tela-cheia-r5-recon | sonnet | complexa, estado confirma, fixtures: sem mecanismo; browser 3, teste 15, codigo 2 |
| 4.2 | dúvidas e roteiro | — | — | 1 dúvida / 0 perguntadas (assumida A), roteiro: 37 provas, aprovado como proposto |
| 4.3 | plano | alarme-tela-cheia-r6-plano | opus | parcial: teto de janela no turn 13, nada escrito; c1 disparado |
| 4.3 | plano, c1 | alarme-tela-cheia-r6-plano-c1 | opus | parcial: esqueleto + 3 seções + decisões por CP no ## Parcial; c2 disparado |
| 4.3 | plano, c2 | alarme-tela-cheia-r6-plano-c2 | opus | completo: 37 passos / 5 cp, 13/13 RT, 8/8 PR, 13/13 CB, marcos: 2, onda única, 6 desvios spec, 5 desvios padrão |
| 4.3 | revisão do plano r1 | alarme-tela-cheia-r7-revisao-1 | opus | corrigir (parcial, teto): 6 bloqueios, 4 notas; resto da revisão vai para r2 |
| 4.3 | plano, volta 1 | alarme-tela-cheia-r8-plano-v1 | opus | 6 consertados, 0 recusados; +RT-011 lane codigo, +caso T06; cobertura 13/13 |
| 4.3 | revisão do plano r2 | alarme-tela-cheia-r9-revisao-2 | opus | corrigir: 1 bloqueio (fullScreen na soneca em background), 3 notas; r1 6/6 corrigidos |
| 4.3 | plano, volta 2 | alarme-tela-cheia-r10-plano-v2 | opus | 1 bloqueio + 3 notas consertados, 0 recusados; cobertura 13/13 |
| 4.3 | revisão do plano r3 | alarme-tela-cheia-r11-revisao-3 | opus | aprovado (1 nota de pontuação) |
| 4.4 | gate do plano | — | — | fechado pelo orquestrador (briefing › Premissas): aprovado |

## Dúvidas técnicas (4.2)
Levantadas: som no silencioso (RT-004, USAGE_ALARM) conflita com notify-kit (RT-013), que só usa USAGE_NOTIFICATION.
Perguntadas: nenhuma (usuário delegou o 4.2 ao orquestrador).
Assumidas: (A) notify-kit para agendar/tela cheia/reinício/ações + módulo Expo próprio de som em loop com USAGE_ALARM.

## Roteiro de comprovação (4.2)
Proposto: 37 provas — 18 screenshots, 19 casos de suíte
Ambiente: `pnpm dev` na raiz (API :3333 + Expo web :8081)
Fechado: aprovado como proposto (orquestrador); planejador acrescentou ids RT-003→T16, RT-004→T17, RT-008→T06/T08 e casos em T06, T07, T14
Arquivo: roteiro.md

## Gate do plano (4.4)
aprovado (pelo orquestrador, por delegação do usuário no briefing)

## Premissas assumidas
- Dúvida 1 = A (módulo de som próprio). AC-004 prevalece sobre PR-001. Simulação de permissão negada no web por `?simular=` (dev-only).
- `canUseFullScreenIntent` no handler de background com app fechado não confirmado; fallback: soneca da notificação volta como aviso no topo.
- Tela abre por cima do bloqueio sempre que o app está na frente (risco registrado no plano).

## Desvios da spec
- 6 declarados no plano (PR-001 vs AC-004, USAGE_ALARM via módulo, PR-005 sem vídeo, PR-008 à mão, provas no aparelho sem captura, RT-010 só título); nenhum visto pelo usuário em gate (gate delegado).

## Handoffs
- 4.3 plano: r6-plano parcial (janela, turn 13) → c1 parcial (janela, turn 19) → c2 completou.
- 4.3 revisão r1: parcial por janela com 6 bloqueios; o restante foi conferido na r2.

## Revisão do plano (4.3)
aprovado na rodada 3

## Resultado
plano aprovado
Plano: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/plano.md
Lanes: browser, teste, codigo
Cobertura: 13/13 RT
Provas: 37 do roteiro no plano de teste; acrescentadas pelo planejador: seções codigo RT-001, RT-004, RT-011, RT-013 e casos em T06/T07/T14; dispensadas: nenhuma
Checkpoints: 5 (37 passos; marco 1 no CP2, marco 2 no CP3)
Desvios de padrão: 5 declarados no plano, aceitos pela revisão
Fixtures: sem mecanismo
Ambiente: `pnpm dev` na raiz
Estado: nenhum
Fim: 2026-11-07
