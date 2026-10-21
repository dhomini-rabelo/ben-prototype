# Verdict tests-01 — contexto-memoria

nonce: modelos-gasto-historico-r12-test-tres

**PASS com ressalva**

Ambiente: Expo web 8082 (390x844), proxy 3334 -> server-ben 3335, sqlite /tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/test.db (cópia de dev.db com a migration 20261021215717 já aplicada), usuário u1. Sem chave de LLM nem AssemblyAI: nenhuma chamada real ao modelo ou à transcrição. Suíte raiz: `pnpm test` exit 0 (chat 12 arquivos/54 testes, task 9/42, topic 6/28, user 6/28, transcription 1/5).

## Provado
- vitest dos 4 use cases: load-agent-context (via get-history-context.test.ts / topic), record-conversation, save-memories, get-history-context. Todos verdes (topic 6 arquivos/28 testes).
- Tabelas `conversations` e `memories` existem na cópia sqlite (node:sqlite: lista de tabelas contém ambas, vazias antes do teste).
- Filtro de datas (GreaterQuery em campo date) no SQLite REAL via `SqliteConversationRepository` e `findActiveConversation` (cópia `/tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/ctx.db`, script `/tmp/claude-1000/-root-so-repos-ben-prototype/3056d428-6148-44ec-9515-5489bb2a88de/scratchpad/r12-ctx.ts`), fechando o ponto em aberto do implementer:
  - conversa em t0 expira em t0+24h exatos (CONVERSATION_TTL_MS = 24h);
  - chave gerada: `conversa:encontro-familiar:2026-10-21T10:00:00.000Z/2026-10-22T10:00:00.000Z`;
  - ativa em t0+1h e t0+23h59; nula em t0+24h exato (comparação estrita) e t0+25h; nula para outro usuário;
  - nova mensagem na janela atualiza a mesma conversa (mesmo id, slug preservado, expiresAt = nova lastMessageAt + 24h) e a estende;
  - mensagem após expirar cria uma nova conversa (id diferente, slug kebab `nova-conversa`).

## Não provado (sem chave)
- Que a fase context do agente receba `# Conversa atual` e `# Memórias do usuário` e que o LLM devolva `memories` com `familia:nome-familiares` (resalva 1 e 2 da review r1): depende de LLM real.
- A rota de chat gravando conversa e memórias ponta a ponta (chat.ts:192-203) não foi acionada.
- Persistência real de memórias (upsert por chave) no SQLite: coberta só por teste unitário com repositório in-memory.

## Bugs
Nenhum encontrado.
