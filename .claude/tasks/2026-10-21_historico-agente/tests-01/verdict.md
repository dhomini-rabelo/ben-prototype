# Verdict tests-01 — historico-agente

nonce: modelos-gasto-historico-r12-test-tres

**PASS com ressalva**

Ambiente: Expo web 8082 (390x844), proxy 3334 -> server-ben 3335, sqlite /tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/test.db (cópia de dev.db com a migration 20261021215717 já aplicada), usuário u1. Sem chave de LLM nem AssemblyAI: nenhuma chamada real ao modelo ou à transcrição. Suíte raiz: `pnpm test` exit 0 (chat 12 arquivos/54 testes, task 9/42, topic 6/28, user 6/28, transcription 1/5).

## Provado
- vitest de ListMessageHistoryUseCase (list-message-history.test.ts): exclui a âncora e as mais novas, no máximo 15 em ordem cronológica, paginação por nextCursor sem sobreposição, ignora outro usuário, erro de âncora de outro usuário.
- No SQLite real (repositório Prisma, cópia `/tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/hist.db`, 40 mensagens u1 + script `/tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/r12-hist.ts`): âncora = mensagem 39 devolve 15 (h24..h38, cronológico, hasMore true); cursor devolve 15 (h9..h23, hasMore true); terceira página 9 (h0..h8, hasMore false). Total 39 = tudo anterior à âncora, sem repetir.
- Tool get-older-messages (`older-messages-tool.ts`) com resolver dublê (script `/tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/r12-tool.ts`): duas chamadas simultâneas são serializadas e consomem c1 e c2 em ordem (resolver chamado só com c1, c2); depois de esgotar devolve `{messages: [], hasMore: false}`; cursor inicial null devolve vazio sem chamar o resolver.

## Não provado
- O agente de fato receber as 15 mensagens como mensagens estruturadas user/assistant e decidir chamar a tool: exige LLM real; `packages/infra/adapters` não tem suíte de testes (sem script test:unit), então o adapter só foi exercitado pelo script descartável acima.
- A rota POST de chat com agente dublado não foi acionada (o server 3335 usa o provedor real, sem chave); a ordem "mensagem atual gravada antes e fora do histórico" fica provada só pela âncora no caso de uso.
- Limite de steps com a tool (CONTEXT_MAX_STEPS) não verificado em execução.

## Bugs
Nenhum encontrado.
