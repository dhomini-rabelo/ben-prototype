# Backend Ben: descrição

## Propósito

API Node.js do Ben. Atende o app `packages/infra/mobile/ben` e cobre: login com Google (Firebase), chat com o agente Ben, transcrição de áudio, captura de notas, lembretes e tarefas a partir das mensagens, o workspace de tarefas (diff, todos, conclusão) e as preferências do agente.

O backend é um conjunto de packages pnpm, não uma pasta única. O processo que sobe é o `@ben/server-ben`; os outros packages são dependências dele.

## Módulos de domínio

Cada módulo é um package `@ben/domain-<nome>` com `src/enterprise/entities/`, `src/application/{use-cases,repositories}/` e testes ao lado.

| Módulo | Entidades | Use cases (`application/use-cases/`) |
|---|---|---|
| `user` | `user` | `auth/`, `agent-preferences/`, `user-preferences/` |
| `task` | `task` | `tasks/` |
| `chat` | `message`, `note`, `reminder` | `messages/` (inclui `list-message-history`), `captures/` |
| `topic` | `topic`, `topic-summary`, `conversation`, `memory` | `topics/`, `context/`, `conversations/`, `memories/` |
| `transcription` | (nenhuma) | `transcription/` |

Quem é dono de quê entre módulos está em [`packages/domain/ownerships.md`](../../../../packages/domain/ownerships.md): `task` é dono de `TaskRepository` (usado por `persist-captures` do `chat`) e `user` é dono de `resolveAgentSelection` (usado por `task`).

## Comportamentos do agente e do usuário

- **Catálogo de modelos** (`user/application/utils/agent-models.ts`): GPT-6 Luna (`openai/gpt-6-luna`, padrão) e GPT-6.1 Sol (`openai/gpt-6.1-sol`, sem esforço `none`). Um slug salvo fora do catálogo cai no padrão na leitura, com o esforço ajustado ao que o modelo suporta.
- **Preferências do usuário** (`user-preferences/`): idioma (`language`, nulo até ser salvo) e `showUsdCost` (padrão `false`) ficam na entidade `user`, no servidor.
- **Custo em USD por interação**: `message` guarda `costUsd` (da própria mensagem) e `interactionCostUsd` (total da interação). O custo do LLM vem de `usage.cost` do OpenRouter (`usage: { include: true }`, em `ben-agent-provider/models.ts`); o da transcrição é duração do áudio x preço por hora do modelo de speech (`PRICE_PER_HOUR_USD_BY_MODEL` em `assemblyai-transcription-provider.ts`). Sem dado, o custo fica `null`. O custo também entra no trace da mensagem.
- **Histórico enviado ao agente**: `ListMessageHistoryUseCase` devolve as 15 mensagens do usuário e do Ben anteriores à mensagem atual (`MESSAGE_HISTORY_PAGE_SIZE`), em ordem cronológica, paginadas por cursor. O agente as recebe como mensagens estruturadas e tem a tool `get-older-messages` (`older-messages-tool.ts`), que entrega a próxima página mais antiga a cada chamada.
- **Contexto de conversa e memória** (módulo `topic`): a tool `get-history-context` devolve o resumo de tópicos, a conversa ativa e as memórias. A conversa atual é registrada a cada mensagem pelo `RecordConversationUseCase` (a resposta estruturada do agente traz `conversation: { slug, summary }`) e aparece com a chave `conversa:{slug}:{ultima-mensagem}/{expiracao}` (datas ISO; `toConversationKey`). A expiração é a última mensagem + 24h (`CONVERSATION_TTL_MS`); expirada, deixa de ser devolvida. Memórias são chave/valor do usuário com chave `categoria:subcategoria` (por exemplo `familia:nome-familiares`), gravadas pelo `SaveMemoriesUseCase` a partir de `memories` na resposta estruturada do agente; a chave é normalizada em kebab-case e entradas fora do formato de dois segmentos são ignoradas.

## Regras de negócio

As regras de negócio e os casos de uso do v1 estão em [razao-de-negocio-e-casos-de-uso-v1.md](../../../memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md). Este contexto não as repete.

## Fluxos do sistema

Endpoints e fluxos em [system-flows/README.md](./system-flows/README.md).

## Mais contexto

- [technology-stack.md](./technology-stack.md)
- [architecture-overview.md](./architecture-overview.md)
- [project-structure.md](./project-structure.md)
