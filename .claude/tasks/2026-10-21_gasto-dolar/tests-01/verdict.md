# Verdict tests-01 — gasto-dolar

nonce: modelos-gasto-historico-r12-test-tres

**PASS com ressalva**

Ambiente: Expo web 8082 (390x844), proxy 3334 -> server-ben 3335, sqlite /tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/test.db (cópia de dev.db com a migration 20261021215717 já aplicada), usuário u1. Sem chave de LLM nem AssemblyAI: nenhuma chamada real ao modelo ou à transcrição. Suíte raiz: `pnpm test` exit 0 (chat 12 arquivos/54 testes, task 9/42, topic 6/28, user 6/28, transcription 1/5).

## Provado
- vitest da raiz verde, incluindo persist-ben-message, persist-user-message, create-task-message e transcribe-audio (costUsd) e get-message-trace.
- Browser 8082, 4 mensagens semeadas via `SqliteMessageRepository` (script `/tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/seed-msgs.ts`): voz do usuário com costUsd 0.0004, Ben com costUsd 0.0119 e interactionCostUsd 0.0123, Ben sem custo, usuário sem custo.
  - Switch ligado (estado do usuário u1 no servidor, showUsdCost=true): só a resposta com custo mostra o rodapé `US$ 0,0123` (acessível como "Custo desta interação: US$ 0,0123"); respostas sem custo não mostram nada. Screenshot: tests-01/screenshots/r12-on.png.
  - Desligado pelo switch em Configurações (Custo > Mostrar gasto em dólar): após recarregar /chat nenhum valor aparece; o sqlite do servidor registra `showUsdCost:false` (a preferência é gravada no servidor). Screenshot: tests-01/screenshots/r12-off.png.
- O rodapé exibe interactionCostUsd (total da interação), não costUsd da mensagem sozinha (0.0119 não aparece).

## Não provado (sem chave)
- costUsd real vindo de usage.cost do OpenRouter e custo real da transcrição AssemblyAI por duração; a soma LLM + transcrição na rota de chat só é coberta por testes unitários/dublês, não por chamada real.
- O rodapé aparecer logo após enviar uma mensagem nova (fluxo ao vivo); só testado com dados já salvos.
- Mensagem de voz do usuário não exibe rodapé próprio (por desenho); o custo dela só entra na soma da resposta.

## Bugs
Nenhum encontrado.
