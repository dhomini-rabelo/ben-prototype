# Handoff O1 → O2

Briefing: .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/briefing.md
Ledger: .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/log.md

## Próxima rodada
Rodada r4, um filho `sonnet`, description `lembrete-criado-abrir-tela-r4-proto-base`: é o subagente "A base" da Etapa 3 da skill.
- Ele lê: P/prototipo.md (`## Escolha`) e a seção "### A base" de .claude/skills/decidir-especificar-e-planejar/SKILL.md.
- Ele apaga as rotas e o código das variações V1 e V3, **só** dentro de `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/` e `packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/`.
- Ele mantém a V2 (v2.tsx, v2-2.tsx, v2-3.tsx, variacao-2.tsx e o que ela importar de shared.tsx/parts.tsx), roda typecheck e eslint do pacote e o `git status --short`.
- Ele acrescenta ao fim de P/prototipo.md a seção `## Base final`, com os caminhos que sobraram.
- Sem commit. O prompt leva o bloco de teto do orquestrador.md e a regra de não sub-delegar nem chamar AskUserQuestion.
Depois dele vem a Etapa 4 da skill (passos 4.1 a 4.5).

## Pendências, em ordem
1. r4 — limpeza da base (acima).
2. Etapa 4 da skill. Leia em .claude/skills/decidir-especificar-e-planejar/SKILL.md a seção "## Etapa 4 — planejar" inteira (A quebra em partes, O protótipo como insumo, Regras do nível 0, passos 4.1 a 4.5, Premissas desta skill) e os `prompts/` e `formats/` da pasta da skill, cada um antes do passo que o usa.
   - Nesta cadeia, **você (O2) faz o papel de "nível 0" da skill**. Você escreve `log-planejamento.md` e dispara o reconhecimento, o planejador e o revisor como filhos seus, com o bloco de teto e o description `lembrete-criado-abrir-tela-r{n}-{papel}`.
   - O planejador e o revisor rodam em opus. O reconhecimento roda em sonnet.
3. Passo 4.1, reconhecimento: projeto.md e reconhecimento.md. Insumos: P/r0-mobile.md e P/r0-backend.md, para não refazer o mapa.
4. Passo 4.2, dúvidas técnicas e roteiro de prova. **Gate do usuário via `bloco: perguntas`**, porque ele escolheu passar por todos os gates.
5. Passo 4.3, plano.md e revisão do plano (até 3 rodadas do revisor).
6. Passo 4.4, **gate do plano via `bloco: perguntas`**.
7. Passo 4.5, entrega: relatorio-final.md, mais `bloco: fim` com a linha que chama `/implementar-e-validar` com esta pasta.

## Já fechado
- r0, reconhecimento: P/r0-mobile.md e P/r0-backend.md.
- Gate 1, ideia principal e escolhas de produto: respostas em briefing.md.
- Etapa 1: P/decisao.md, veredito `vai`, aprovado pelo usuário. Sem entrevista e sem complementos.
- Etapa 2: P/spec.md, com 20 AC, 4 RT, 12 CB, 10 PR e [Visual]. O `## Gate` está fechado: aprovada sem ajuste, Protótipo sim, 1 parte. Insumo do gate: P/r1-spec.md.
- Etapa 3: P/prototipo.md, com Variações, Prints e `## Escolha` = **V2, rótulo absorvido**. Os prints estão em P/prototipo/.

## Armadilhas
- Os primeiros prints empilhavam as três telas numa rota rolável, com rótulos de seção, molduras e escala 2x. O usuário não conseguiu ver e pediu uma tela inteira por print, 390x844, escala 1x, como `.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1.png`. Qualquer print novo, incluindo os de prova na implementação, segue esse formato.
- O Playwright MCP não conecta para os filhos. Os prints saem com `playwright-core` e o Chrome local, como está documentado em P/prototipo.md.
- `packages/infra/mobile/ben/app/prototipo/` e `src/prototipo/` também guardam protótipos de outras runs (alarme-tela-cheia, header-menu-footer), sem commit. A limpeza da base não pode tocar neles.
- A memória `business-rules/razao-de-negocio-e-casos-de-uso-v1.md` diz que recorrente não é v1, mas o código já tem goal com daily/weekdays. Vale o código, e a memória fica desatualizada: atualizar é do usuário.

## Premissas
- Todas as de briefing.md seguem valendo.
- O gate da spec confirmou estas: o card atualiza o rótulo só ao recarregar a conversa (CB-010); dias soltos aparecem listados, como "Seg, Qui"; o conditional mostra só o selo de tipo na lista e no detalhe e "Quando acontecer" no card; en usa "One-time", "Every day", "Weekdays" e "Mon, Wed".
- O protótipo foi feito no app Expo, com as rotas `app/prototipo/...`, e não na galeria `packages/infra/mobile/design`. A regra do projeto de desenhar na galeria antes de implementar fica para o plano decidir se atualiza a galeria; a galeria está defasada em relação ao app (r0-mobile.md §4).
- Os gates da skill reabrem `bloco: perguntas`. Eles não contam no teto de duas rodadas da Etapa 0.

## Estado do mundo
- Arquivos novos sem commit, de propósito, porque a skill manda deixar o protótipo sem commit: `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/` e `packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/`.
- O Expo web roda na porta 8081 (PID 23795). Já estava de pé antes da run; nenhum filho subiu nem parou.
- Branch main, sem commit da run.

## Janela
Fechei em ~114k, teto 140k, 40 turns de 50.
