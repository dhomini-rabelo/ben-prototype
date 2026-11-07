# Handoff O1 → O2

Briefing: .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/briefing.md
Ledger: .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/log.md

## Próxima rodada
Etapas 1 a 3 da skill `decidir-especificar-e-planejar` estão fechadas; falta a **Etapa 4 inteira**.
Leia `.claude/skills/decidir-especificar-e-planejar/SKILL.md` só a partir de `## Etapa 4 — planejar`
(linha ~803 até o fim). Nessa etapa, o papel que a skill chama de "nível 0" é **você** (orquestrador):
você escreve `log-planejamento.md`, `roteiro.md` e, se houver, `ondas.md` nesta pasta; os gates com o
usuário saem como `bloco: perguntas` (o nível 0 real só repassa).

Rodada 5, agora:
1. Leia `.claude/skills/decidir-especificar-e-planejar/formats/log-planejamento.md` e escreva o
   cabeçalho de `log-planejamento.md` nesta pasta.
2. Dispare **um** filho, `subagent_type: general-purpose`, `model: sonnet`,
   `description: header-menu-footer-r5-recon`, passo 4.1. O prompt passa os caminhos de
   `.claude/skills/decidir-especificar-e-planejar/prompts/reconhecimento.md`, da pasta da run,
   `spec.md`, `decisao.md`, `prototipo.md` e `formats/roteiro.md` (da skill), a task em uma frase, e
   diz em uma linha: **`projeto.md` não existe; o reconhecimento levanta o cartão antes de tudo**
   (formato em `formats/projeto.md` da skill). Leva o bloco de teto do orquestrador.md com o
   description dele. Entregas: `projeto.md` e `reconhecimento.md` nesta pasta.
3. Com o retorno: passo 4.2 (gate de dúvidas + roteiro, `bloco: perguntas` com o
   `## Roteiro de comprovação` repassado sem resumir), depois 4.3 (planejador em sonnet/opus pelo
   veredito de dificuldade, `description: header-menu-footer-r{n}-plano`; revisor em opus,
   `header-menu-footer-r{n}-revisao-plano-{k}`), 4.4 (gate do plano) e 4.5 (entrega + relatorio-final.md).
   Use as convenções de description da sem-nivel-0 (`{slug}-r{n}-{papel}`), não as da skill.

## Pendências, em ordem
1. 4.1 reconhecimento (projeto.md + reconhecimento.md)
2. 4.2 gate de dúvidas e roteiro → roteiro.md
3. 4.3 plano + revisão do plano (até 2 voltas)
4. 4.4 gate do plano
5. 4.5 entrega: relatorio-final.md com a linha `/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/`

## Já fechado
- r0 reconhecimento: r0-mobile.md, r0-design.md
- gate-1 (ideia, escopo): briefing.md, decisao.md (veredito vai, aprovado)
- r1 spec: spec.md (19 AC, 7 RT, 12 CB, 11 PR, 1 parte), `## Gate` no fim (protótipo sim; workspace igual ao chat; voltar → chat)
- r2 protótipo V1–V3; r3 V4 (V1 + ajustes do usuário); r4 base: prototipo.md `## Escolha` = V4, prints em prototipo/v4*.png

## Armadilhas
- O Playwright MCP (`browser-mobile-tester`, porta 8931) deu CONNECT_TIMEOUT; os prints saíram com o pacote `playwright` do Node em /tmp/pw + google-chrome do sistema (ver prototipo.md). O roteiro de prova deve prever esse caminho.
- `WaveBar` real não desenha no web (Animated.View ignora className); o protótipo usou cópia local `ProtoWaveBar`. É ponto para o plano.
- O auto-crescimento do campo na V4 usa `scrollHeight` do textarea (só web); no nativo precisa `onContentSizeChange`. Ponto para o plano.
- `medir-janela.sh` só roda a partir da raiz do repo.

## Premissas
- As do `briefing.md` (seção Premissas) seguem valendo.
- O protótipo rodou no app mobile (Expo web :8081), não no sandbox :3002, porque a skill pede o stack do app e a ferramenta de captura é amarrada à :8081. O sandbox entra na implementação (escopo "Sandbox + mobile + doc").
- Os gates da skill vão ao usuário como rodadas extras de `bloco: perguntas` (já foram 4).

## Estado do mundo
- Expo web de pé na :8081, subido pelo filho r2 (log em .claude/tmp/expo-r2.log).
- Arquivos novos sem commit (base do protótipo, a skill manda não commitar): `packages/infra/mobile/ben/app/prototipo/header-menu-footer/v4.tsx`, `packages/infra/mobile/ben/src/prototipo/header-menu-footer/shared.tsx`. Há outras pastas de protótipo de outras runs (`alarme-tela-cheia`, `lembrete-criado-abrir-tela`): não tocar.
- Nenhum arquivo existente do projeto foi modificado. Nenhuma branch criada.

## Janela
Fechei em 113k, teto 140k, 35 turns de 50. Handoff na fronteira Etapa 3 → Etapa 4, para a etapa de planejamento (com dois gates e o loop de revisão) começar com janela limpa.
