# Handoff O2 → O3

Briefing: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/briefing.md
Ledger: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/log.md

## Próxima rodada
Etapa 4, Passo 4.1 — reconhecimento. Leia ANTES, na .claude/skills/decidir-especificar-e-planejar/SKILL.md,
só a Etapa 4 (linhas ~803-1026: "A quebra em partes" — já decidida: 1 parte; "O protótipo como
insumo"; "Regras do nível 0" — vale para os seus disparos; Passos 4.1 a 4.5). Depois dispare um
filho `sonnet`, general-purpose, description `alarme-tela-cheia-r5-recon`, com o prompt de
.claude/skills/decidir-especificar-e-planejar/prompts/reconhecimento.md (preenchido conforme o
Passo 4.1), entrega em PASTA/reconhecimento.md (PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/).
Ele lê spec.md (com `## Gate`), prototipo.md (`## Escolha` com `Base:`) e decisao.md. Pontos que o
recon precisa fechar (vêm de r1-spec.md › Premissas e da spec): compatibilidade de
react-native-notify-kit (RT-013) com Expo SDK 54 + expo-notifications juntos; som com USAGE_ALARM no
silencioso (RT-004); loop de som no notify-kit; se o endpoint de soneca do servidor aceita duração
livre (AC-016, slider 5 min–2 h) ou precisa mudar; onde registrar o instante da ação (RT-009).
Bloco de teto do orquestrador.md obrigatório no prompt do filho, com o description dele.

## Pendências, em ordem
1. 4.1 reconhecimento (filho sonnet) → reconhecimento.md.
2. 4.2 dúvidas técnicas e roteiro de prova → roteiro.md; o orquestrador fecha sem gate do usuário
   (briefing › Premissas); dúvida técnica vira premissa recomendada.
3. 4.3 projeto.md + plano.md (filho sonnet ou opus conforme a dificuldade — a parte nativa Android
   tende a pedir opus) e revisão opus (revisao-plano-{n}.md), até 2 voltas; bloqueio da 3ª vira
   premissa.
4. 4.4 sem gate do usuário (briefing).
5. 4.5 relatorio-final.md com a linha `/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/` e `bloco: fim`.

## Já fechado
- r0 mobile e pesquisa: r0-mobile.md, r0-pesquisa.md (O1). Gate rodada 1 no briefing.md.
- r1 decisão + spec: decisao.md (vai menor, decisão do usuário registrada), spec.md, r1-spec.md.
- Gate rodada 2: spec aprovada; notify-kit → RT-013; teto 10 min aceito; só o aviso da hora vira
  alarme (AC-004 reescrita). `## Gate` em spec.md (Protótipo: sim; Partes: 1).
- r2 protótipo: V1–V3, prints prototipo/v1*..v3*.png; prototipo.md.
- Gate rodada 3: V1 com ajustes → AC-003 alterada (só título), AC-016 nova (slider soneca).
- r3 V4 (V1 ajustada): prints prototipo/v4*.png.
- Gate rodada 4: V4 aprovada; AC-003 e AC-016 aprovadas. `## Escolha` em prototipo.md.
- r4 base: rotas v1–v3 apagadas; base = lista em prototipo.md › `## Escolha` › `Base:`
  (inclui variacao-1.tsx, que a V4 importa); typecheck/eslint ok; prototipo/base-check.png.

## Armadilhas
- Não leia r0-*.md nem os prints: passe caminhos aos filhos (O1 entrou em handoff por ler r0 inteiro).
- Memória business-rules/razao-de-negocio-e-casos-de-uso-v1.md ("sem OS notification / alarmes
  mockados") está desatualizada frente ao código (r0-mobile §3).
- No web (:8081) o notifications-service é no-op; só o overlay in-app roda (polling 15 s). Som no
  web exige um clique antes (autoplay).
- Playwright MCP não estava disponível para os filhos; eles usaram a lib `playwright` com o
  Chrome local em 390x844 — diga isso a qualquer filho que precise de print.
- `git status --short` colapsa app/prototipo/ e src/prototipo/: lá também há protótipos de outras
  tasks (header-menu-footer, lembrete-criado-abrir-tela), sem commit, que ninguém desta task toca.
- RT-010 da spec ainda fala em "título e horário" vindos da notificação; com AC-003 a tela mostra só
  o título — o plano trata o horário como dado de agendamento, não de exibição.

## Premissas
- Todas de briefing.md › Premissas.
- As de r1-spec.md › Premissas (lista em r1-spec.md), exceto as que os gates resolveram (teto 10 min
  e avisos: decididos pelo usuário).
- O alarme aparece por cima do resumo diário (CB-011): não foi perguntado ao usuário; vale a spec.
- Faixa do slider (5 min–2 h, passo 5, começa em 15 min) foi proposta pelo O2/filho e aprovada pelo
  usuário na rodada 4.
- Premissas do protótipo em prototipo.md (`## Premissas do protótipo`, `## Premissas da V4`,
  `## Premissas da base`).

## Estado do mundo
- Expo web em :8081 já estava rodando antes desta task (não foi subido por nós); siga reaproveitando.
- Arquivos novos sem commit: base do protótipo em packages/infra/mobile/ben/app/prototipo/alarme-tela-cheia/
  e src/prototipo/alarme-tela-cheia/ (esperado pela skill: ficam sem commit até a implementação).
- Nenhum outro arquivo do projeto editado; nada de commit, push ou branch.

## Janela
Fechei em 91k, teto 140k, 42 turns de 50 (status=handoff por turns: próxima medição no 45 e a
Etapa 4 tem 3+ rodadas).
