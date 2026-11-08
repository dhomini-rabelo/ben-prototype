# Planejamento — centralizar logo + "Ben | data" no topo do chat e levar o menu ao footer (sheet com as 4 opções), com input e gravação redesenhados

Início: 2026-11-07 16:34
Pasta: .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/
Projeto: @ben/mobile-ben, @ben/mobile-design, ux-philosophy.md — projeto.md
Spec: 19 AC, 12 CB, 7 RT, 11 PR — spec.md
Parte: sem quebra
Onda: onda única (a confirmar pelo plano)
Roteiro: 55 provas: 55 screenshots, 0 casos de suíte — roteiro.md

## Etapas

| # | Papel | Agente | Modelo | Veredito |
|---|---|---|---|---|
| 4.1 | reconhecimento | header-menu-footer-r5-recon | sonnet | complexa, estado confirma, fixtures: sem mecanismo, 7 RT codigo / 11 PR browser, roteiro S01–S55 |
| 4.2 | dúvidas e roteiro | — | — | 3 dúvidas / 1 perguntada (misto real+mock), roteiro: 55 provas, aprovado como proposto |
| 4.3 | plano | header-menu-footer-r6-plano | opus | parcial (teto turn 23): 27 passos / 4 cp, 7/7 RT, 11/11 PR, 12/12 CB, marcos: 2, onda única |
| 4.3 | plano, continuação c1 | header-menu-footer-r7-plano-c1 | opus | completo: Parcial fechada (5 leituras), E1 com sqlite, 7/7 RT, 11/11 PR, 12/12 CB |
| 4.3 | revisão do plano r1 | header-menu-footer-r8-revisao-plano-1 | opus | parcial (teto turn 18): corrigir, 2 bloqueios até aqui (1 padrão, 1 implementabilidade) |
| 4.3 | revisão do plano r1, continuação c1 | header-menu-footer-r9-revisao-plano-1-c1 | opus | corrigir: 5 bloqueios (1 padrão, 4 implementabilidade), 12 notas, 3 desvios aceitos |
| 4.3 | plano, volta 1 | header-menu-footer-r10-plano-c2 | opus | 5 consertados, 0 recusados, 11/12 notas, 3 desvios de padrão declarados |
| 4.3 | revisão do plano r2 | header-menu-footer-r11-revisao-plano-2 | opus | corrigir: 1 bloqueio novo (z-index do scrim, passo 6), 5 notas; r1 5/5 resolvidos |
| 4.3 | plano, volta 2 | header-menu-footer-r12-plano-c3 | opus | 1 consertado (z-60/z-70), 0 recusados, 5/5 notas |
| 4.3 | revisão do plano r3 | header-menu-footer-r13-revisao-plano-3 | opus | aprovado: 0 bloqueios, 2 notas, 3 desvios aceitos |
| 4.4 | gate do plano | — | — | aprovado |

## Dúvidas técnicas (4.2)
Levantadas: sessão e dados das provas do app real; RT-006 com 44px de toque contra os 32px da V4; CB-003 (voltar do aparelho) e CB-005/CB-006 (teclado) no web.
Perguntadas: sessão e dados → misto: backend real no caminho feliz e interceptação Playwright nas bordas.
Assumidas: hitSlop até 44px nos botões de 32px; CB-003 provada com Escape; CB-005/006 provadas com o campo focado no web.

## Roteiro de comprovação (4.2)
Proposto: 55 provas — 55 screenshots, 0 casos de suíte
Ambiente: PERSISTENCE_DRIVER=sqlite pnpm dev (server :3333 + Expo :8081) e pnpm dev:design (:3002)
Fechado: aprovado como proposto
Arquivo: roteiro.md

## Gate do plano (4.4)
aprovado

## Premissas assumidas
- As 3 de Assumidas acima.
- Do plano: envio só pelo botão (Enter quebra linha); cancelar a gravação só pelo X; Settings abre sobre o chat; peça nova DraggableSheetOverlay; botão do menu no rodapé já no checkpoint 2, abrindo o menu de tela cheia até o checkpoint 3; o server das provas sobe com PERSISTENCE_DRIVER=sqlite, com 2 usuários criados por script.

## Desvios da spec
- nenhum

## Handoffs
- 4.3 plano: r6-plano parou no teto de janela; r7-plano-c1 continuou.
- 4.3 revisão r1: r8 parou no teto de janela; r9-revisao-plano-1-c1 continuou.

## Revisão do plano (4.3)
aprovado na rodada 3 (r1: 5 bloqueios, r2: 1 bloqueio, ambos consertados em duas voltas)

## Resultado
plano aprovado
Plano: .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/plano.md
Lanes: browser, codigo
Cobertura: 7/7 RT
Provas: 55 do roteiro no plano de teste; acrescentadas pelo planejador: nenhuma; dispensadas: nenhuma
Checkpoints: 4
Desvios de padrão: 3 declarados no plano
Fixtures: sem mecanismo
Ambiente: PERSISTENCE_DRIVER=sqlite pnpm dev + pnpm dev:design
Estado: NODE_ENV=development PERSISTENCE_DRIVER=sqlite pnpm --filter @ben/server-ben exec tsx .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/estado/montar-estado.ts
Fim: 2026-11-07 17:16
