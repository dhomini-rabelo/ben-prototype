# Backend Ben: endpoints e fluxos

Rotas registradas em `packages/infra/server-ben/src/app.ts`. Todas, exceto `/health` e `/auth/login-or-register`, passam por `authMiddleware`. O handler de cada rota fica em `packages/infra/server-ben/src/routes/` e chama o use case do módulo de domínio indicado.

| Método e rota | Handler | Módulo de domínio |
|---|---|---|
| `GET /health` | `app.ts` | |
| `POST /auth/login-or-register` | `routes/auth/login-or-register.ts` | `user` (`auth/`) |
| `GET /messages/list` | `routes/messages/list-messages.ts` | `chat` (`messages/`) |
| `GET /messages/:id/trace` | `routes/messages/get-message-trace.ts` | `chat` (`messages/`) |
| `POST /chat` | `routes/chat.ts` | `chat` (mensagens, capturas), `topic` (índice e histórico), `user` (preferências do agente) |
| `POST /transcription` (upload `audio`) | `routes/transcription.ts` | `transcription` |
| `GET /tasks/list`, `GET /tasks/:id/detail` | `routes/tasks/` | `task` |
| `POST /tasks/:id/messages/create` | `routes/tasks/create-task-message.ts` | `task` |
| `POST /tasks/:id/diff/approve`, `/diff/reject` | `routes/tasks/` | `task` |
| `POST /tasks/:id/content/update`, `/todos/update` | `routes/tasks/` | `task` |
| `POST /tasks/:id/finish`, `/reopen` | `routes/tasks/` | `task` |
| `GET /notes/list`, `GET /notes/:id/detail` | `routes/notes/` | `chat` (`captures/`) |
| `GET /reminders/list`, `GET /reminders/:id/detail` | `routes/reminders/` | `chat` (`captures/`) |
| `GET /captures/counts` | `routes/captures/get-captures-counts.ts` | `chat` (`captures/`) |
| `GET /agent-preferences/detail`, `POST /agent-preferences/update` | `routes/agent-preferences/` | `user` (`agent-preferences/`) |

## Fluxo principal

1. O app autentica com Google (Firebase) e chama `POST /auth/login-or-register`, que devolve o JWT do Ben.
2. O áudio gravado vai para `POST /transcription` (AssemblyAI) e o texto volta para o app.
3. `POST /chat` grava a mensagem do usuário, monta o contexto de tópicos (`topic`), chama o agente Ben (`BenAgentProviderService`) com as preferências do usuário e grava a resposta, as capturas (`persist-captures`: notas, lembretes e tarefas) e os resumos de tópico.
4. Listas e detalhes (`/notes`, `/reminders`, `/tasks`, `/captures/counts`) alimentam o menu e o workspace de tarefas no app.
5. No workspace de tarefas, `/tasks/:id/messages/create` conversa com o agente sobre a tarefa; o diff proposto é aprovado ou rejeitado, e a tarefa é concluída ou reaberta.

As regras de negócio por trás dos fluxos estão em [razao-de-negocio-e-casos-de-uso-v1.md](../../../../memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md). Os fluxos acima vêm das rotas e dos use cases do código; abra o handler e o use case antes de alterar o comportamento.
