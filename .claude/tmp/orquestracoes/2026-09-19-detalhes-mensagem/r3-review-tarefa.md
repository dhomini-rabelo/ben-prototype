# Tarefa — revisão do plano, sem viés de aprovar

Você é o **revisor** do plano desta feature. O usuário pediu explicitamente um revisor que **não
seja tendencioso a aprovar**. Aprovar um plano ruim é o pior resultado possível aqui: o
implementador é `sonnet` e vai executar o que estiver escrito, letra por letra, sem desconfiar.

Você **não edita nenhum arquivo do projeto** e **não conserta o plano**. Você julga e aponta.

## Leia, na ordem

1. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/briefing.md` — o contrato e a definição de pronto.
2. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r1-design.md` — a especificação de design, fechada.
3. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r2-plano.md` — o plano que você julga, 40 passos.

Depois carregue, pela tool `Skill`: `code-get-coding-designs` e `code-write-code`. São o padrão de
código contra o qual você mede o plano.

## Como revisar

**Verifique contra o código real, não contra a plausibilidade.** Esta é a sua obrigação central e é
o que distingue esta revisão de uma leitura. Para cada passo do plano que cita um arquivo, uma
função, um campo, um componente, uma prop ou uma dependência: **abra o arquivo e confirme que
existe e que se chama assim**. Um plano coerente que cita um símbolo inexistente falha na mão do
implementador, e nenhuma leitura atenta pega isso sem abrir o arquivo.

Cheque, nesta ordem de gravidade:

1. **Correção factual.** Símbolo que não existe, caminho errado, assinatura diferente, campo com
   outro nome, dependência que o `package.json` não tem, comando que não existe no `scripts`.
2. **Lógica.** O passo produz o que ele diz que produz? A ordem funciona — nenhum passo depende de
   algo que só existe num passo posterior? Os estados de erro e vazio fecham? O fluxo do dado vai
   do modelo até a tela sem buraco?
3. **A definição de pronto do briefing.** Os 7 itens saem deste plano, um a um? Diga qual item sai
   de quais passos. Item que não sai de passo nenhum é bloqueante.
4. **O design.** Os cinco desvios conscientes do `r1-design.md` que o plano declara na §2: cada um
   é justificado tecnicamente, ou é atalho? Há desvio **não** declarado?
5. **Padrão de código do repo.** Nomes, estrutura de pasta, camadas, jeito de fazer store, hook,
   presenter, rota. Onde o plano inventa um jeito novo tendo um precedente no repo, é achado.
6. **Buracos para o implementador.** Onde o plano diz "ajuste conforme necessário", "similar ao
   existente", ou deixa um nome/formato sem definir. Cada um é um ponto onde um `sonnet` vai
   improvisar.

Olhe com atenção redobrada os seis pontos que o planejador marcou como frágeis: `messageId` na
resposta do `POST /chat` e a deduplicação que ele arrasta; a ausência de migração no sqlite; o trace
de dois steps (`context` e `format`); a falha do modelo não persistida; a altura do sheet em pixels;
e o item R7, que diz que não há `.env` nem banco e que nada roda na porta 8081.

## O veredito

Um dos dois, e ele abre o seu arquivo:

- **`APROVADO`** — o plano pode ir para o implementador como está. Só escreva isso se você abriu os
  arquivos e conferiu. Achado cosmético não impede aprovação: liste como "não bloqueante".
- **`RECUSADO`** — existe pelo menos um achado bloqueante. Liste-os numerados, cada um com: o passo
  do plano, o que está errado, a evidência (arquivo e linha real que você abriu), e **o que
  precisa mudar**. O planejador vai corrigir lendo só a sua lista, então ela precisa bastar.

Não amacie o veredito para ser agradável, e não recuse para parecer rigoroso. Achado sem evidência
de arquivo aberto não entra na lista de bloqueantes.

## Regras

- Não sub-delegue: não use a tool `Agent`.
- Não chame `AskUserQuestion`: toda ambiguidade vira premissa assumida, documentada no seu arquivo.
- Não edite arquivo do projeto e não reescreva o plano. Você aponta; quem corrige é o planejador.

## Entrega

Escreva em: `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r3-review.md`

Comece com a linha `VEREDITO: APROVADO` ou `VEREDITO: RECUSADO`. Depois os achados bloqueantes
numerados, depois os não bloqueantes, depois a tabela dos 7 itens da definição de pronto e de quais
passos cada um sai.

## Teto de janela

Rode `bash /root/so/repos/ben-prototype/.claude/skills/sem-nivel-0/scripts/medir-janela.sh "r3-review"` a cada ~15 turns.
Se vier `status=handoff` ou `status=preso`, pare, escreva o arquivo com o que já tem, marque o que
não deu tempo de verificar, e retorne.

## Retorno

No máximo 10 linhas: o caminho do arquivo, o veredito, e quantos bloqueantes.
