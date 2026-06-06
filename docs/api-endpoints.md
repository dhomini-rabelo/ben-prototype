# API Endpoints — Ben v1

Endpoints necessários para os casos de uso de cada tela, derivados de `02-features-and-states.md` e `04-data-model.md`.

Convenções:

- REST sobre HTTP/JSON, servidos pelo Express (`project-backend/src/infra/http/`).
- Nomes de rotas em **kebab-case** com a ação explícita no path (ex: `/messages/list`, `/messages/create`, `/tasks/:id/detail`). HTTP method é `GET` para leitura e `POST` para escrita — sem `PATCH`/`PUT`/`DELETE`.
- Todas as rotas (exceto `POST /auth/login-or-register`) exigem autenticação via dois headers:
  - `jwtauthenticationtoken` — JWT emitido pelo servidor.
  - `providerauthenticationtoken` — token do Firebase (provider). O servidor revalida em background; se o JWT for renovado, responde com o header `updatedjwtauthenticationtoken`.
  - O `userId` vem do contexto de auth injetado pelo middleware, **nunca** do body/query.
- Respostas de erro seguem o error handler central (`project-backend/src/infra/http/error-handler.ts`).
- A classificação (note/reminder/task) acontece **server-side** via tool-use do Claude/GPT — o cliente não escolhe o tipo; ele manda a mensagem e recebe de volta o que o Ben filou.

---

## Tela: Sign-in (Google via Firebase)

Casos de uso: entrar com Google, validar tokens ao abrir o app.

O fluxo OAuth acontece **no cliente** via Firebase SDK. Após o Google autenticar o usuário, o cliente envia o token do Firebase para o backend.

- **`POST /auth/login-or-register`**
  - Recebe o provider token do Firebase.
  - Body: `{ token: string }`.
  - Cria o `User` se não existir (register) ou recupera o existente (login).
  - Retorna `{ process: 'login' | 'register', user, accessToken }` — o `accessToken` é o JWT usado nas demais rotas.
  - Cobre os estados **Empty/Loading** (botão Continue with Google) e **Already signed in** (cliente verifica o JWT local antes de exibir a tela).

> Não há endpoint de signout — o auth é stateless (JWT). O cliente descarta o token localmente.

---

## Tela: Chat (home)

Casos de uso: carregar histórico + tarefas ativas, ditar/digitar uma captura, ver o Ben classificar e filar, recuperar de erros.

- **`GET /messages/list?limit=20&before={cursor}`**
  - Carrega a janela de mensagens (estado **Loading** → **Populated**). `before` pagina o scroll-back.
  - Janela fixa de 20 no v1; sem retrieval.

- **`POST /messages/create`**
  - Envia mensagem de texto. Server transcreve (se aplicável), roda o tool-use e responde.
  - Body: `{ content: string }`. Retorna `{ userMessage, benMessage, capture? }` — `capture` carrega o card inline (note/reminder/task) já criado.
  - Cobre estados **Awaiting Ben reply** e a criação otimista dos **inline capture cards**.

- **`POST /messages/create-audio`**
  - Upload do clipe de voz (≤30s, webm/opus). Server transcreve (Whisper) e segue o mesmo fluxo do texto.
  - Body: `multipart/form-data` com o áudio. Retorna `{ userMessage, benMessage, capture? }`.
  - Cobre **Transcribing** → **Awaiting Ben reply**. Reuso do mesmo endpoint serve o **retry** do bubble de erro.

- **`POST /chat`** (streaming)
  - Rota de chat em streaming consumida pelo hook `useChat` do `@ai-sdk/react` no frontend. Escopo v1: **reply-only** e **latest-message-only** — o Ben só responde à última mensagem do usuário, sem classificação de captura e sem contexto multi-turn no request.
  - **Auth:** mesmos headers das demais rotas (`jwtauthenticationtoken` + `providerauthenticationtoken`), via `authMiddleware`. O `userId` vem do contexto de auth, nunca do body.
  - **Request body:** o payload que o `useChat` envia (protocolo de mensagens da UI do AI SDK) — uma lista de mensagens em `messages` onde cada item é um `UIMessage` com `role` e `parts[]`. O servidor lê **apenas a última mensagem do usuário** (concatenando suas `parts` de texto) e ignora o histórico anterior. O histórico para semear a conversa continua vindo de `GET /messages/list`.
  - **Response:** um **stream de mensagens da UI** (não um JSON único), produzido via `result.pipeUIMessageStreamToResponse(res)` do AI SDK e consumido pelo `useChat`. O reply do Ben é persistido (como `Message` com `role: 'ben'`) quando o stream termina (`onFinish`).
  - **Provider:** Google Gemini Flash Lite via Vercel AI SDK, isolado atrás do port `AgentService` (`src/adapters/agent-provider.ts`) — a rota nunca importa o SDK diretamente. Detalhes de integração em `docs/vercel-ai-sdk.md`.

- **`GET /tasks/list?status=active`**
  - Alimenta o **active-task peek** (contagem + título mais recente) no carregamento do chat.

---

## Inline capture cards & Item detail modal

Casos de uso: abrir o detalhe de uma note/reminder a partir do card no chat. (Tasks abrem a workspace — ver seção própria.)

- **`GET /notes/:id/detail`**
  - Detalhe completo da nota (modal Item detail — estado **Populated (Note detail)**).
  - Resposta: `{ item: Note }` (convenção `ItemResponse<T>`), onde `Note = { id: string, title: string, body: string, capturedAt: string (ISO) }`.
  - Edge case **item deletado em outra sessão** → 404, UI fecha com "this one's gone".

- **`GET /reminders/:id/detail`**
  - Detalhe do reminder (`firesAt` absoluto/relativo, status upcoming/fired).
  - Resposta: `{ item: Reminder }`, onde `Reminder = { id: string, title: string, firesAt: string | null (ISO), body: string | null, status: "upcoming" | "fired", capturedAt: string (ISO) }`.
  - Mapeamento a partir da entity: `remindAt → firesAt`, `notes → body`, `createdAt → capturedAt`. `status` é **derivado** no presenter: `"upcoming"` se `firesAt` for nulo ou futuro, `"fired"` se passado.

> Cards são criados pela resposta do `POST /messages/create` / `POST /messages/create-audio` — não há endpoint de criação dedicado. No v1, notes e reminders são read-only (correções via conversa), então não há rotas de update aqui.

---

## Tela: Menu sidebar (Tasks / Notes / Reminders / Settings)

Casos de uso: navegar o histórico completo, ver contagens, abrir cada item.

- **`GET /sidebar/counts`** — **não implementado no v1**. As contagens dos badges (tasks ativas, total de notes, total de reminders) são **derivadas no cliente** a partir das três listas abaixo. Mantido aqui apenas como referência futura.

- **`GET /tasks/list?status=active|finished`**
  - Tasks view: retorna ativas + finalizadas (cliente separa nas seções **Active** / **Finished**).
  - Já implementado. Resposta: `{ items: TaskListItem[] }` (`ListingResponse<T>`, ver `task-presenter.toListItemHttp`).

- **`GET /notes/list`**
  - Notes view (reverse-chronological por `createdAt`), com preview truncado por linha no cliente.
  - Resposta: `{ items: NoteListItem[] }` (`ListingResponse<T>`), onde `NoteListItem = { id, title, body, capturedAt }` (mesma shape de `Note`; `body` serve de preview na lista).

- **`GET /reminders/list`**
  - Reminders view: retorna todos; o cliente separa as seções **Upcoming** / **Fired** por `status`.
  - Resposta: `{ items: ReminderListItem[] }` (`ListingResponse<T>`), onde `ReminderListItem = { id, title, firesAt, body, status, capturedAt }` (mesma shape de `Reminder`).

- **`GET /me/detail`** — **não implementado neste bloco**. O Settings sheet usa os dados do `user` já retornados por `POST /auth/login-or-register` e mantidos no cliente. Fallback de erro mostra só o email do contexto de auth.

---

## Tela: Task workspace

Casos de uso: abrir/continuar uma task, colaborar via sub-thread, revisar e aprovar/rejeitar diffs do Ben, editar conteúdo direto, marcar como finalizada.

- **`GET /tasks/:id/detail`**
  - Carrega a workspace inteira (título, contentType, conteúdo, `pendingDiff` se houver). Estado **Loading** → conteúdo.
  - Como Task é um aggregate auto-contido, esta única chamada traz tudo (texto OU todos + diff pendente).

- **`POST /tasks/:id/messages/create`**
  - Composer da sub-thread (voz ou texto, scoped à task). Roda o tool-use do Ben no contexto da task.
  - Retorna `{ benMessage, pendingDiff? }` — se o Ben propôs mudança, vem o diff para o **diff bar**.

- **`POST /tasks/:id/diff/approve`**
  - Commita o `pendingDiff`: aplica as mudanças ao conteúdo e limpa o diff. Escopo por turn.
  - Edge case: falha de rede → diff bar mostra retry, estado pendente preservado.

- **`POST /tasks/:id/diff/reject`**
  - Descarta o `pendingDiff` sem aplicar; conteúdo reverte. Diff bar some.

- **`POST /tasks/:id/content/update`**
  - Edição direta do usuário no corpo de texto (`contentType = 'text'`).
  - Regra v1: se houver `pendingDiff`, esta edição **invalida e descarta** o diff (reconciliação).

- **`POST /tasks/:id/todos/update`**
  - Edição da lista de todos (`contentType = 'todo'`): toggle `done`, reorder, editar título, adicionar/remover.
  - Body com a operação ou o array atualizado de `todoItems`. Mesma regra de invalidação de diff pendente.

- **`POST /tasks/:id/finish`**
  - Marca a task como `finished`. Sai do peek/active, vai pro histórico (estado **Finished**).

- **`POST /tasks/:id/reopen`**
  - Reabre uma task finalizada (volta a `active`), habilitando o composer. Edge case "returning from history".

---

## Notas de escopo

- **Sem endpoints de scheduler no v1** — alarmes são mockados; `firesAt`/`status` são lidos pelas views, sem job que dispara. Scheduler global entra no v2 (`GET`/job sobre reminders `upcoming`).
- **Sem create/update dedicado de notes/reminders** — só nascem via chat e são read-only no v1.
- **Sem Notion, sem recurring, sem TTS** — deferidos (v1.5/v2), sem rota no v1.
- **Otimismo de UI** (cards aparecem antes de persistir) é responsabilidade do cliente; os endpoints apenas confirmam/persistem e expõem retry idempotente onde aplicável.
