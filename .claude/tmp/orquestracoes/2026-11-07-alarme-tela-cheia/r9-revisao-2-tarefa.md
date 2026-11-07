# Tarefa — revisor do plano, rodada 2 (Etapa 4, Passo 4.3) — alarme-tela-cheia

Siga, inteiro, `.claude/skills/decidir-especificar-e-planejar/prompts/revisor-plano.md` (rodada ≥ 2:
`## Bloqueios da rodada anterior` e `## Novos nesta rodada`).
Substituição: a medição de teto é a do bloco TETO abaixo (com o seu description), não o `--self`.

PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
- Rodada: 2
- Saída: PASTA/revisao-plano-2.md
- Rodada anterior: PASTA/revisao-plano-1.md. A rodada 1 parou por janela: a seção `## Parcial` dela
  lista o que ficou sem conferir (skills de backend e de testes, algumas linhas citadas do mobile,
  tsconfig/eslint para `index.ts` e `plugins/*.d.ts`). Confira isso nesta rodada, além dos 6 bloqueios.
- Plano corrigido: PASTA/plano.md (a seção `## Lista da volta 1` mapeia bloqueio → conserto).
- Entradas: PASTA/spec.md, PASTA/roteiro.md, PASTA/reconhecimento.md, PASTA/projeto.md,
  PASTA/prototipo.md, .claude/skills/decidir-especificar-e-planejar/formats/plano.md.
- Premissa aberta do planejador: `requireOptionalNativeModule` no Expo 54 não foi confirmado (o
  `expo-modules-core` não estava instalado); julgue se a alternativa descrita no plano basta.

Skills: `code-write-code` e `code-get-coding-designs` — SKILL.md e só os subarquivos ainda não
conferidos (backend/domain e testes).

## Orçamento (as rodadas anteriores estouraram a janela lendo)
- Leia o plano por seções (offset/limit). Comece pela `## Lista da volta 1` e pelos passos que ela
  cita. Código: só `grep -n` / offset+limit nas linhas citadas.
- Escreva revisao-plano-2.md cedo (esqueleto com veredito provisório) e complete com Edit.
- Achado novo só se bloqueia a implementação ou fere convenção; "detalhar melhor" não é achado.

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada.
- Não edite arquivo do projeto nem o plano. Escreva o arquivo antes de retornar.
- Retorno: ponteiro, veredito (`aprovado` | `corrigir`), no máximo 10 linhas, com os `## Desvios de
  padrão` aceitos em uma linha.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r9-revisao-2"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/revisao-plano-2.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
