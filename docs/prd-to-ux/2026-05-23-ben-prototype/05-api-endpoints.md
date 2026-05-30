# API Endpoints — Ben v1

Endpoints necessários para os casos de uso de cada tela, derivados de `02-features-and-states.md` e `04-data-model.md`.

Convenções:

- REST sobre HTTP/JSON, servidos pelo Express (`project-backend/src/infra/http/`).
- Todas as rotas (exceto auth) exigem sessão autenticada; o `userId` vem do contexto de auth, **nunca** do body/query.
- Respostas de erro seguem o error handler central (`project-backend/src/infra/http/`).
- A classificação (note/reminder/task) acontece **server-side** via tool-use do Claude/GPT — o cliente não escolhe o tipo; ele manda a mensagem e recebe de volta o que o Ben filou.

---

## Tela: Sign-in (Google OAuth)

Casos de uso: entrar com Google, recuperar sessão ao abrir o app, sair.

- **`GET /auth/google`**
  - Inicia o fluxo OAuth — redireciona para o Google.
  - Cobre o botão **Continue with Google** (estado Empty/Loading).

- **`GET /auth/google/callback`**
  - Callback do Google: cria/recupera o `User`, abre sessão, redireciona para o chat.
  - Trata estados **Error** (OAuth falhou) e **Permission-denied** (usuário cancelou).

- **`GET /auth/session`**
  - Retorna a sessão atual (ou 401). Resolve o edge case **Already signed in** (pula a tela).

- **`POST /auth/signout`**
  - Encerra a sessão. Usado pela ação **Sign out** do Settings modal.

---

## Tela: Chat (home)

Casos de uso: carregar histórico + tarefas ativas, ditar/digitar uma captura, ver o Ben classificar e filar, recuperar de erros.

- **`GET /messages?limit=20&before={cursor}`**
  - Carrega a janela de mensagens (estado **Loading** → **Populated**). `before` pagina o scroll-back.
  - Janela fixa de 20 no v1; sem retrieval.

- **`POST /messages`**
  - Envia mensagem de texto. Server transcreve (se aplicável), roda o tool-use e responde.
  - Body: `{ content: string }`. Retorna `{ userMessage, benMessage, capture? }` — `capture` carrega o card inline (note/reminder/task) já criado.
  - Cobre estados **Awaiting Ben reply** e a criação otimista dos **inline capture cards**.

- **`POST /messages/audio`**
  - Upload do clipe de voz (≤30s, webm/opus). Server transcreve (Whisper) e segue o mesmo fluxo do texto.
  - Body: `multipart/form-data` com o áudio. Retorna `{ userMessage, benMessage, capture? }`.
  - Cobre **Transcribing** → **Awaiting Ben reply**. Reuso do mesmo endpoint serve o **retry** do bubble de erro.

- **`GET /tasks?status=active`**
  - Alimenta o **active-task peek** (contagem + título mais recente) no carregamento do chat.

---

## Inline capture cards & Item detail modal

Casos de uso: abrir o detalhe de uma note/reminder a partir do card no chat. (Tasks abrem a workspace — ver seção própria.)

- **`GET /notes/:id`**
  - Detalhe completo da nota (modal Item detail — estado **Populated (Note detail)**).
  - Edge case **item deletado em outra sessão** → 404, UI fecha com "this one's gone".

- **`GET /reminders/:id`**
  - Detalhe do reminder (`firesAt` absoluto/relativo, status upcoming/fired).

> Cards são criados pela resposta do `POST /messages` / `POST /messages/audio` — não há endpoint de criação dedicado. No v1, notes e reminders são read-only (correções via conversa), então não há `PATCH`/`DELETE` aqui.

---

## Tela: Menu sidebar (Tasks / Notes / Reminders / Settings)

Casos de uso: navegar o histórico completo, ver contagens, abrir cada item.

- **`GET /sidebar/counts`**
  - Badges do painel: `{ activeTasks, notesTotal, remindersUpcoming }`. Estado **Loading** mostra skeleton só nos badges.
  - Opcional — pode ser derivado das listas abaixo se preferir menos rotas.

- **`GET /tasks`**
  - Tasks view: retorna ativas + finalizadas (cliente separa nas seções **Active** / **Finished**).
  - Query opcional `?status=active|finished` para carregar uma seção por vez.

- **`GET /notes?before={cursor}`**
  - Notes view (reverse-chronological), com preview truncado por linha.

- **`GET /reminders?before={cursor}`**
  - Reminders view: upcoming (asc por `firesAt`) + fired (desc). Cliente separa as seções.

- **`GET /me`**
  - Perfil do Settings modal: `{ name, email, avatarUrl }`. Fallback de erro mostra só o email do contexto de auth.

---

## Tela: Task workspace

Casos de uso: abrir/continuar uma task, colaborar via sub-thread, revisar e aprovar/rejeitar diffs do Ben, editar conteúdo direto, marcar como finalizada.

- **`GET /tasks/:id`**
  - Carrega a workspace inteira (título, contentType, conteúdo, `pendingDiff` se houver). Estado **Loading** → conteúdo.
  - Como Task é um aggregate auto-contido, esta única chamada traz tudo (texto OU todos + diff pendente).

- **`POST /tasks/:id/messages`**
  - Composer da sub-thread (voz ou texto, scoped à task). Roda o tool-use do Ben no contexto da task.
  - Retorna `{ benMessage, pendingDiff? }` — se o Ben propôs mudança, vem o diff para o **diff bar**.

- **`POST /tasks/:id/diff/approve`**
  - Commita o `pendingDiff`: aplica as mudanças ao conteúdo e limpa o diff. Escopo por turn.
  - Edge case: falha de rede → diff bar mostra retry, estado pendente preservado.

- **`POST /tasks/:id/diff/reject`**
  - Descarta o `pendingDiff` sem aplicar; conteúdo reverte. Diff bar some.

- **`PATCH /tasks/:id/content`**
  - Edição direta do usuário no corpo de texto (`contentType = 'text'`).
  - Regra v1: se houver `pendingDiff`, esta edição **invalida e descarta** o diff (reconciliação).

- **`PATCH /tasks/:id/todos`**
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
