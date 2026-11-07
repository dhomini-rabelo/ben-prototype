# Handoff O1 → O2

Briefing: .claude/tmp/orquestracoes/2026-11-07-logo-antiga/briefing.md
Ledger: .claude/tmp/orquestracoes/2026-11-07-logo-antiga/log.md
Ledger da Etapa 4 (formato da skill): .claude/tmp/orquestracoes/2026-11-07-logo-antiga/log-planejamento.md

A task segue a skill decidir-especificar-e-planejar (`.claude/skills/decidir-especificar-e-planejar/SKILL.md`). Etapas 1, 2 e passos 4.1, 4.2 e a primeira volta do 4.3 estão fechados. Falta: revisão do plano rodada 2, gate do plano (4.4) e entrega (4.5). Leia em SKILL.md só as linhas 943 a 1026 (passos 4.3 a 4.5).

## Próxima rodada
Dispare 1 filho, `model: opus`, `subagent_type: general-purpose`, `description: logo-antiga-r6-revisao-plano-2`: revisor do plano rodada 2. Prompt: papel em `.claude/skills/decidir-especificar-e-planejar/prompts/revisor-plano.md`; ler P/plano.md, P/spec.md, P/roteiro.md, P/reconhecimento.md, P/projeto.md, `formats/plano.md` da skill e a revisão anterior P/revisao-plano-1.md; rodada 2; saída P/revisao-plano-2.md; sem protótipo; mais o bloco de teto dos filhos e as regras de sempre (não editar código, não AskUserQuestion, não sub-delegar, retorno ≤ 12 linhas). P = `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-logo-antiga/`.

Depois, pela tabela do passo 4.3: `aprovado` → gate 4.4; `corrigir` → planejador fresco `logo-antiga-r7-plano-c2` (sonnet, com P/plano.md e P/revisao-plano-2.md) e revisão 3; na rodada 3, `corrigir` vai ao gate como premissa a confirmar.

Gate 4.4: leia `## Resumo do plano` de P/plano.md e devolva ao nível 0 `bloco: perguntas` com os 7 itens do passo 4.4 no corpo (resumo literal, cobertura e desvios da spec, roteiro em duas linhas, onda única, seções novas, revisão + desvios de padrão, link do plano) e uma pergunta "Aprova o plano?" (Aprovo (recomendada) | Quero ajustar). Aprovado → escreva o ledger (linha 4.4) e o `relatorio-final.md`, e retorne `bloco: fim` com a linha `/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-logo-antiga/` (formato do passo 4.5).

## Pendências, em ordem
1. Revisão do plano rodada 2.
2. Gate do plano (4.4) com o usuário.
3. Entrega (4.5): fechar log-planejamento.md e log.md, escrever relatorio-final.md, `bloco: fim`.

## Já fechado
- r0 mapa do código: r0-mapa-logo.md; gate 1 (ideia, escopo, fundo, dependência) em briefing.md.
- r1 decisão e spec: decisao.md (veredito vai, aprovado; complementos 1 e 3 aceitos, 2 e 4 recusados), spec.md com `## Gate` (11 AC, 5 RT, 7 CB, 9 PR; PR-003/004 cortadas, PR-010/011 novas; protótipo não, design óbvio; 1 parte).
- r2 reconhecimento (4.1): projeto.md, reconhecimento.md; dificuldade simples.
- 4.2: roteiro.md aprovado pelo usuário sem mudanças (17 provas S01–S17, lanes browser e codigo, nenhuma suíte versionada).
- r3 plano (4.3): plano.md, 10 passos, 1 checkpoint, 5/5 RT 9/9 PR 7/7 CB.
- r4 revisão 1: revisao-plano-1.md, parou no teto (parcial), tratada como corrigir: 2 bloqueios.
- r5 plano volta 1: plano.md reescrito, os 2 bloqueios consertados, itens abertos da revisão verificados (resvg instala na raiz, mv da PR-011 funciona, import .mjs→.ts→.ts ok no Node 24).

## Armadilhas
- A revisão 1 estourou o teto no turn 15 lendo muita coisa: no prompt da revisão 2, diga que os itens da `## Parcial` da revisão 1 já foram verificados pelo planejador (topo do plano.md) e que ela não precisa refazer os testes em /tmp.
- O usuário respondeu "quais vc recomenda, bote como (recomendado)" numa pergunta multiSelect: em pergunta de seleção, marque sempre a opção recomendada no label.
- `$TMPDIR` é vazio neste ambiente.

## Premissas
- Veredito e spec foram ao usuário no mesmo gate (issue sem lacunas), para poupar uma rodada.
- Fundo claro dos ícones = `#f6f4f2` (aprovado pelo usuário).
- Ícones levam só o símbolo, sem o wordmark "Ben"; notificação em silhueta branca com barras vazadas e cor de destaque âmbar.
- Sessão para fotos do chat no web (S13–S15): semear `ben.jwttoken` no localStorage com JWT válido do server-ben; sem token de dev, S13–S15 caem para leitura de código mais S12.
- PR-009 foi anexada à S09 no roteiro (estava sem prova de tela).
- Sem teste versionado sobre os PNGs; PR-005, PR-008, PR-010, PR-011 são verificações por comando na validação.

## Estado do mundo
Nada sujo fora do git: nenhum código do projeto foi editado, nenhum serviço subido, nenhuma dependência instalada no repo. Testes do planejador rodaram só em /tmp.

## Janela
Fechei em 119k, teto 140k, 42 turns de 50.
