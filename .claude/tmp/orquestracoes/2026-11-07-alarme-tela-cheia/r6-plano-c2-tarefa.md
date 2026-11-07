# Tarefa — planejador, continuação c2 (Etapa 4, Passo 4.3) — alarme-tela-cheia

Você continua `plano.md`, que as rodadas `r6-plano` e `r6-plano-c1` deixaram parcial. O c1 deixou o
esqueleto com todas as seções obrigatórias, 3 seções completas e, no `## Parcial`, 16 fatos de código
conferidos (caminho e linha), as decisões de cada checkpoint no nível de passo e a ordem do que falta.
**Sua tarefa é redação, não pesquisa: não releia código.**

PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/

## Leia só isto
1. PASTA/plano.md (inteiro: esqueleto + `## Parcial`).
2. PASTA/roteiro.md (as provas S01–S18 e T01–T19 que vão literais para o `## Plano de teste`, e as
   `## Notas do fechamento`).
3. .claude/skills/decidir-especificar-e-planejar/formats/plano.md — só o template e os critérios
   (use `grep -n '^#'` para achar os trechos e leia com offset/limit).
4. PASTA/spec.md só por `grep -n` quando precisar do texto exato de um id.
Código do projeto: no máximo 3 aberturas pontuais (`grep -n` ou offset/limit) para um caminho que o
`## Parcial` não cobre. Nada de skills inteiras.

## O que escrever, em ordem (Edit seção por seção, medindo a janela entre elas)
1. `## Passos` e `## Contratos`.
2. `## Marcos de validação` e `## Plano de teste` (S01–S18, T01–T19 copiados do roteiro sem reescrever
   asserção; só a rodada `[marco m]`/`[final]` muda, e os ids RT-003→T16, RT-004→T17, RT-008→T06/T08
   acrescentados, conforme decidido pelo c1).
3. `## Cobertura` (`N/N RT · N/N PR · N/N CB`), `## Desvios da spec`, `## Desvios de padrão`, riscos e
   `## Premissas` (inclua as do c1 e a Dúvida 1 = A, assumida pelo orquestrador).
4. `## Resumo do plano`, por último. Depois remova `## Parcial`.
Se o teto chegar, o `## Parcial` novo lista as seções completas e as que faltam.

Regras de conteúdo: siga `.claude/skills/decidir-especificar-e-planejar/prompts/planejador.md` (pode
ler as seções "O que fazer" e "Regras" por grep) e as respostas de r6-plano-tarefa.md › "Respostas às
dúvidas técnicas" (Dúvida 1 = A). O último passo remove só as rotas de protótipo desta task
(`alarme-tela-cheia/` em app/prototipo/ e src/prototipo/).

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada.
- Não edite arquivo do projeto. Escreva plano.md antes de retornar.
- Retorno no formato de `prompts/planejador.md` (≤10 linhas + `## Resumo do plano` literal).

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r6-plano-c2"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/plano.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
