# Tarefa r4 — proto-base (limpeza da base do protótipo)

Pasta da run (P): /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/
Entrega: P/r4-proto-base.md

## Leia antes
- P/briefing.md
- P/prototipo.md, em especial `## Escolha` (V2 escolhida; a linha `Base:`)
- /home/fael/so/repos/ben-prototype/.claude/skills/decidir-especificar-e-planejar/SKILL.md, só a seção "### A base" (linhas ~789-801)
- Carregue a skill `code-write-code` antes de editar qualquer arquivo; leia também `code-get-coding-designs` no que tocar o app mobile (`packages/infra/mobile/ben`).

## O que fazer
1. Apague as rotas e o código das variações recusadas V1 e V3, **somente** dentro de:
   - packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/ (v1*.tsx, v3*.tsx)
   - packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/ (variacao-1.tsx, variacao-3.tsx)
2. Mantenha a V2: v2.tsx, v2-2.tsx, v2-3.tsx, variacao-2.tsx, e de shared.tsx/parts.tsx apenas o que a V2 usa (remova exports que só V1/V3 usavam; se um arquivo inteiro ficar sem uso pela V2, apague-o).
3. NÃO toque em nada fora dessas duas pastas. Em especial, `app/prototipo/` e `src/prototipo/` guardam protótipos de outras runs (alarme-tela-cheia, header-menu-footer, sem commit): não mexa neles. Não toque em layouts/_layout de rota fora da pasta da feature; se algum arquivo fora das duas pastas referencia V1/V3, registre no arquivo de entrega e não edite.
4. Rode, na raiz do repo: `pnpm --filter @ben/mobile-ben typecheck` e `pnpm exec eslint packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela` (corrija o que for da base; erro pré-existente fora dela só registre). Rode `git status --short`.
5. Acrescente ao fim de P/prototipo.md a seção `## Base final`, com a lista dos caminhos que sobraram (um por linha, caminho a partir da raiz do repo) e uma linha dizendo que é o ponto de partida visual da implementação. Não altere o resto do prototipo.md.
6. Não suba nem pare o Expo (porta 8081 já está de pé). Não faça commit. Sem prints.

## Entrega (P/r4-proto-base.md)
Seções: `## Apagado` (caminhos), `## Mantido` (caminhos), `## Verificação` (typecheck e eslint: passou/falhou, uma linha cada; o `git status --short` resumido em uma linha por pasta, sem colar saída longa), `## Premissas`.

## Regras
- Não sub-delegue (não chame Agent), não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada no seu arquivo.
- Escreva a entrega antes de retornar. Retorno: caminho da entrega, veredito (ok | parcial | preso), no máximo 10 linhas.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "lembrete-criado-abrir-tela-r4-proto-base"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em P/r4-proto-base.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
