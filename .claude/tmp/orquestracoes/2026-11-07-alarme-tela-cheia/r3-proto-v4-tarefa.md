# Tarefa r3 — V4 = V1 ajustada (Etapa 3, subagente de combinação proto-alarme-tela-cheia-v4)

Task em uma frase: tela de alarme em tela cheia com som para lembretes de horário do Ben; o
usuário escolheu a V1 com ajustes, e você monta a V4 com esses ajustes.

Pasta da run: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/ (PASTA)
Pasta do protótipo (existente): packages/infra/mobile/ben/app/prototipo/alarme-tela-cheia/ e
packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/
Entrega: PASTA/prototipo.md (acrescente a linha V4 em `## Variações` e a seção
`## Premissas da V4`) + prints PASTA/prototipo/v4.png, v4-2.png, ...

## Leia
1. PASTA/prototipo.md — principalmente `## Comentários do usuário (gate, rodada 3)` (verbatim)
   e a linha V1.
2. PASTA/spec.md — `[Visual]` e as ACs AC-003 (alterada: só o título) e AC-016 (nova: slider).
3. Os prints atuais da V1: PASTA/prototipo/v1.png e v1-2.png (os outros só se precisar).
4. .claude/skills/decidir-especificar-e-planejar/SKILL.md, Etapa 3, subseções "Como monta" e
   "Os prints" (linhas ~714-745).
5. Antes de editar: carregue as skills code-get-project-context e code-write-code. As cores do
   app estão no design system do Ben (ver a skill de contexto / design.md citado no `[Visual]`
   › `Manter` da spec).

## Ajustes pedidos (aplique todos na V4, partindo do código da V1)
1. O balão mostra só o título do lembrete ("Buscar o Leo na escola" / "Pick up Leo from
   school"), sem "às 15:00".
2. Mantenha o balão de fala, mas sem o "v" (bico/ponta) na borda de baixo.
3. A escolha da soneca (equivalente ao v1-2) passa a usar as cores do app (design system do Ben),
   não a paleta escura/âmbar da V1.
4. A escolha da soneca tem, no topo, um slider para escolher um tempo próprio (5 min a 2 h, de 5
   em 5 min), acima das opções de hoje (10 min, 30 min, 1 h, 2 h, amanhã de manhã). Mostre o
   valor escolhido e um botão para confirmar. Se o app não tiver slider, use uma lib já
   instalada no pacote ou monte um simples dentro da pasta do protótipo; não instale lib nova.
- Crie a rota nova `app/prototipo/alarme-tela-cheia/v4.tsx`; não altere v1–v3 (o usuário ainda
  pode voltar a elas). Pode reaproveitar/importar partes da V1 em src/prototipo/alarme-tela-cheia/.
- Prints (390x844, Expo web em :8081 já rodando; o Playwright MCP pode não estar disponível —
  a rodada anterior usou a lib `playwright` com o Chrome local): pelo menos v4.png (alarme
  tocando) e v4-2.png (soneca com slider). Os demais estados (título longo, fila, liberar,
  configurações) só se mudaram em relação à V1. Abra e confira TODOS os prints antes de retornar.
- Sem commit, sem editar arquivo existente fora da pasta do protótipo, sem tocar em outros
  protótipos (app/prototipo/header-menu-footer, lembrete-criado-abrir-tela).

## Retorno (até 10 linhas)
`veredito: ok | parcial | preso`, linha V4, lista dos prints conferidos.

## Regras
- Não sub-delegue (não dispare agente). Não chame `AskUserQuestion`; toda ambiguidade vira
  premissa assumida e documentada no seu arquivo.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r3-proto-v4"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em PASTA/prototipo.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
