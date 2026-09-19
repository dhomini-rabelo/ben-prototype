# Tarefa — corrigir o plano, rodada 2

Você é o **planejador**. A primeira versão do seu plano foi revisada por outro agente com instrução
explícita de não ter viés de aprovar, e foi **RECUSADA com 3 bloqueantes**. Você corrige.

Você **não edita arquivo de projeto**. Você mexe só no plano.

## Leia, na ordem

1. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r3-review.md` — os achados. Comece por aqui: é a sua lista de serviço.
2. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r2-plano.md` — o plano que você corrige, **no lugar**.
3. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/briefing.md` — o contrato, se precisar reconfirmar o alvo.
4. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r1-design.md` — a especificação de design, fechada.

Depois carregue, pela tool `Skill`: `code-get-coding-designs` e `code-write-code`.

## O que fazer

**Os 3 bloqueantes, com o arquivo aberto na sua frente.** B1 e B2 são sobre o que o AI SDK v6
realmente devolve em `generateText` com `stopWhen: stepCountIs(2)`. Não confie na sua memória da
API nem na descrição do revisor: **abra os tipos em `node_modules/ai/dist/index.d.ts`** e decida a
partir do que está escrito lá. O desenho da captura depende disso, e errar de novo custa a rodada
inteira.

Em B2 o revisor te dá duas saídas, capturar de verdade ou declarar a limitação e renomear a seção.
**Escolha a que entrega o que o usuário pediu**: ele quer ver o input real que foi para o modelo,
para julgar se o bot está se comportando bem. Uma seção "Messages" que mostra uma linha fixa não
serve para isso. Só caia na segunda saída se a primeira for tecnicamente impossível, e nesse caso
escreva por que, citando o tipo que você abriu.

**Os 9 não bloqueantes.** Corrija os que são baratos. O usuário disse, com todas as letras, que não
quer um loop de correções depois — achado conhecido que fica no plano vira correção depois.
Para cada um que você decidir não corrigir, escreva a linha do porquê.

## Como entregar a correção

**Edite `r2-plano.md` no lugar.** Ele é a única fonte que o implementador vai ler, e duas versões do
plano em disco é exatamente o jeito de o implementador ler a errada. Os passos mantêm a numeração
sempre que possível.

No fim do `r2-plano.md`, acrescente uma seção `## Correções da revisão (rodada 2)`: uma linha por
achado do `r3-review.md`, dizendo o que mudou e em que passo, ou por que não mudou.

Escreva também `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r5-plano-v2.md`,
curto: o que você mudou, achado por achado, e o que o revisor precisa reconferir. É esse arquivo que
o revisor lê primeiro.

## Regras

- Não sub-delegue: não use a tool `Agent`.
- Não chame `AskUserQuestion`: ambiguidade vira premissa assumida e documentada.
- Não edite arquivo de projeto, não instale nada, não rode build.
- Nada de "considere" ou "o implementador pode escolher". Decida.

## Teto de janela

Rode `bash /root/so/repos/ben-prototype/.claude/skills/sem-nivel-0/scripts/medir-janela.sh "r5-plano-v2"` a cada ~15 turns.
Se vier `status=handoff` ou `status=preso`, pare, salve o que já corrigiu, marque o que ficou, e retorne.

## Retorno

No máximo 10 linhas: o que mudou em B1, B2 e B3, e quantos não bloqueantes você corrigiu.
