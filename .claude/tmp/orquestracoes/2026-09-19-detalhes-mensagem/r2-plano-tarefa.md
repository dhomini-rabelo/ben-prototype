# Tarefa — plano de implementação

Você é o **planejador** desta feature. Sua entrega é um plano que um agente `sonnet` vai executar
**sem revisar e sem inventar**. Tudo que você deixar vago vira decisão dele, e ele vai decidir pior
que você. Antes do seu plano rodar, outro agente `opus` vai revisá-lo com instrução explícita de
**não ter viés de aprovar** — um plano vago volta para você e custa uma rodada.

Você **não edita nenhum arquivo do projeto**. Você escreve um arquivo só: o plano.

## Leia antes de planejar, na ordem

1. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/briefing.md` — o contrato. A definição de pronto é o alvo.
2. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r1-design.md` — a especificação de design, **já decidida e fechada**. Você a executa, não a rediscute. Se algo nela for tecnicamente inviável, diga qual item e por quê, e proponha a alternativa mais próxima.
3. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r0-backend-dados.md` — o que existe no backend hoje.
4. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r0-mobile-chat.md` — o que existe no chat do mobile hoje.

Depois carregue as skills, pela tool `Skill`: `code-get-coding-designs` (padrões de código dos dois
apps que você toca, `project-backend` e `project-mobile`) e `code-write-code`.

**Leia de verdade os arquivos que você vai mandar alterar.** Um plano que cita uma função que não
existe, ou um campo com nome errado, é pior que nenhum plano: o implementador vai improvisar. Abra
cada arquivo que aparece no seu plano antes de escrever a linha que o cita.

## O que o plano precisa cobrir

**1. Backend — a captura, que hoje não existe**
- Onde, no caminho da chamada ao modelo, o input e o output brutos são capturados. Nome real do
  arquivo, da função e das variáveis que já carregam esses dados.
- A forma do dado: o shape exato do que é guardado como input (system prompt, histórico enviado,
  definição das tools) e como output (texto cru, tool calls, tokens/usage, id do modelo, latência,
  timestamps). Decida os nomes dos campos e escreva-os.
- Persistência: onde isso vive no sqlite, a migração necessária, e o que acontece com as linhas
  antigas. Confirme lendo o driver e as migrações reais antes de prescrever.
- A rota HTTP que expõe o trace por mensagem: método, caminho, formato da resposta, comportamento
  quando a mensagem não tem trace, comportamento quando o id não existe, autenticação.
- Onde entram os `console.log` pré-existentes do `ben-agent-provider`: ficam, saem, ou viram o
  dado persistido?

**2. Mobile — do dado à tela**
- Cliente de API, tipos/contratos, hook de busca (React Query), store se for preciso.
- Quando o trace é buscado: no long-press, na abertura do sheet, ou junto do histórico. Justifique.
- A ligação do long-press na bolha da mensagem, respeitando a §A do design.
- O componente de menu e o componente de sheet, com caminho e nome de arquivo seguindo a convenção
  do repo.
- Os itens que o design marcou como pré-requisito: a dependência de clipboard, o token novo de
  fonte, a prop nova no overlay, o campo novo em `BenMessageMetadata`. Cada um com o arquivo e a
  mudança exata.
- Os estados: carregando, vazio, erro.

**3. A ordem de execução**
Passos numerados, cada um com: os arquivos tocados (caminho absoluto), o que muda em cada um, e
**como se verifica que o passo funcionou**. O implementador é `sonnet`: prefira muitos passos
pequenos e verificáveis a poucos passos grandes.

**4. Os riscos**
O que pode dar errado e o que o implementador faz nesse caso. Inclua explicitamente a armadilha do
`measureInWindow` numa `FlatList inverted` que o design sinalizou, e o que fazer se o
posicionamento ancorado não funcionar.

**5. A prova**
Os comandos de lint e tsc dos dois projetos, e o roteiro que o browser tester vai seguir no app
rodando na porta 8081, passo a passo, incluindo como criar uma mensagem do bot com trace para
testar.

## Regras

- Não sub-delegue: não use a tool `Agent`.
- Não chame `AskUserQuestion`: toda ambiguidade vira premissa assumida, numa seção `Premissas` do
  seu arquivo.
- Não edite arquivo do projeto, não rode build, não instale dependência. Você planeja.
- Nada de "considere", "talvez", "o implementador pode escolher". Cada decisão é sua e está escrita.

## Entrega

Escreva em: `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r2-plano.md`

Caminhos absolutos, nomes reais, passos numerados. Escrito para quem não viu a sua janela.

## Teto de janela

Rode `bash /root/so/repos/ben-prototype/.claude/skills/sem-nivel-0/scripts/medir-janela.sh "r2-plano"` a cada ~15 turns.
Se vier `status=handoff` ou `status=preso`, pare, escreva o plano com o que já tem, marque
explicitamente o que ficou incompleto, e retorne.

## Retorno

No máximo 10 linhas: o caminho do plano, quantos passos ele tem, e as decisões que o revisor
precisa olhar com mais atenção.
