# Relatório de Funcionalidades Testáveis — Ben Prototype

> **Snapshot:** 2026-06-04 · branch `main`
>
> Este documento é um **levantamento do que já está implementado e pode ser testado hoje** nos sistemas do `ben-prototype`, com o comportamento esperado de cada funcionalidade descrito em detalhe.
>
> Ele reflete o **estado atual do código** (não o plano de produto). Onde o código diverge dos documentos de planejamento em [docs/](docs/), isso está sinalizado na seção [Divergências em relação aos docs](#9-divergências-em-relação-aos-docs-de-planejamento).

---

## 1. Mapa dos sistemas

O repositório tem três projetos. Apenas dois são executáveis e testáveis hoje:

| Projeto | Papel | Executável hoje? |
| --- | --- | --- |
| [project-backend/](project-backend/) | API Node.js (Express 5 + TypeScript) que serve o app | **Sim** — `npm run dev` |
| [project-web/](project-web/) | Web app real do Ben (Vite + React 19) que consome a API | **Sim** — `npm run dev` |
| [project-design/](project-design/) | Sandbox de design (galeria de telas estáticas) | Sim, mas é só protótipo visual — sem lógica de negócio |

O **fluxo de ponta a ponta testável** é: `project-web` (porta **3001**) → `project-backend` (porta definida em `API_PORT`).

> **Importante para os testes:** o backend usa **repositórios em memória** ([project-backend/src/infra/http/repositories.ts](project-backend/src/infra/http/repositories.ts)). **Todos os dados (mensagens, capturas, tasks, tópicos) são perdidos a cada restart do servidor.** Não há MongoDB conectado ainda, apesar do modelo de dados descrito em [docs/data-model.md](docs/data-model.md).

---

## 2. Pré-requisitos para testar

### 2.1 Backend

Variáveis de ambiente obrigatórias (validadas por Zod em [project-backend/src/infra/services/env.ts](project-backend/src/infra/services/env.ts)) — o servidor **não sobe** se faltar qualquer uma:

- `API_PORT` — porta da API.
- `NODE_ENV` — `development` carrega `.env.development`.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — credenciais do Firebase Admin (validação do token Google).
- `JWT_PRIVATE_KEY`, `JWT_EXPIRATION_TIME_IN_SECONDS` — emissão/validação do JWT da própria API.
- `GOOGLE_GENERATIVE_AI_API_KEY` — chave do **Google Gemini** (agente do Ben).
- `ASSEMBLYAI_API_KEY` — chave do **AssemblyAI** (transcrição de áudio).

Rodar:

```bash
cd project-backend && npm run dev
```

### 2.2 Web

- Variável `VITE_BACKEND_URL` — URL do backend (usada pelo client Axios em [project-web/src/api/client.ts](project-web/src/api/client.ts)).
- Configuração do Firebase no front em [project-web/src/core/firebase.ts](project-web/src/core/firebase.ts) para o login Google.

Rodar (sobe na porta **3001**, exigida pelo CORS do backend):

```bash
cd project-web && npm run dev
```

> O CORS do backend libera apenas `http://localhost:3001` e `https://dev-dhomini.remktos.com` ([project-backend/src/infra/http/app.ts](project-backend/src/infra/http/app.ts)). Rodar o web em outra porta quebra as requisições.

---

## 3. Autenticação com Google (Firebase)

**Telas/arquivos:** [project-web/src/pages/login/page.tsx](project-web/src/pages/login/page.tsx), [project-web/src/layout/hooks/use-google-auth.ts](project-web/src/layout/hooks/use-google-auth.ts), endpoint [project-backend/src/infra/http/routes/auth/login-or-register.ts](project-backend/src/infra/http/routes/auth/login-or-register.ts).

### Comportamento esperado

1. Na tela de login (`/`), o usuário clica em **"Continue with Google"**.
2. O front abre o popup do Google via Firebase SDK (`signInWithPopup`) e obtém o **ID token** do Google.
3. O front envia esse token para **`POST /auth/login-or-register`** no corpo `{ token }`.
4. O backend valida o token no Firebase Admin e:
   - se já existe `User` com aquele `providerId` → **login**;
   - se não existe → **register** (cria o usuário; `username` = parte antes do `@` do e-mail).
5. A resposta é `{ process: 'login' | 'register', user, accessToken }`. O `accessToken` é o **JWT** da API.
6. O front grava dois cookies (validade 5 dias): `@ben/jwttoken` (o JWT) e `@ben/authprovidertoken` (o token do Google), e redireciona para `/chat`.

### Detalhes e estados

- **Sessão / guarda de rota:** o componente [Auth](project-web/src/core/auth.tsx) protege `/chat` e `/tasks/:taskId`. Se o cookie do JWT não existir, redireciona para login.
- **Headers em toda requisição autenticada:** o Axios injeta automaticamente `jwtauthenticationtoken` e `providerauthenticationtoken` ([client.ts](project-web/src/api/client.ts)).
- **Renovação de token:** se o middleware do backend renova o JWT, devolve no header `updatedjwtauthenticationtoken`; o front substitui o cookie automaticamente.
- **Expiração / 401:** qualquer resposta `401` limpa os cookies e joga o usuário de volta para o login.
- **Cancelamento do popup:** se o usuário fecha o popup, a tela mostra *"looks like that didn't go through — want to try again?"*; outros erros mostram *"Authentication failed. Please try again."*.
- **Não há signout no servidor** — o logout é só descartar o cookie no cliente (auth stateless por JWT).

> ⚠️ **Limitação conhecida (ver seção 10):** o `UserRepository` é instanciado **separadamente** no login e no middleware de auth. Enquanto o JWT estiver válido, tudo funciona; a **reemissão de JWT por expiração** tentaria buscar o usuário num repositório vazio e falharia.

---

## 4. Chat com o Ben (núcleo do app)

**Tela:** [project-web/src/pages/chat/page.tsx](project-web/src/pages/chat/page.tsx) (rota `/chat`).

É a funcionalidade mais completa. Reúne: envio de mensagem, resposta do agente, classificação automática em capturas, memória de tópicos, histórico paginado e captura por voz.

### 4.1 Envio de mensagem de texto

**Fluxo:** [messages-store](project-web/src/pages/chat/stores/messages-store/index.ts) → [requestSendChatMessage](project-web/src/api/requests/chat.ts) → **`POST /chat`** ([chat.ts](project-backend/src/infra/http/routes/chat.ts)).

Comportamento esperado:

1. O usuário digita e envia. O front adiciona **otimisticamente** a bolha do usuário e mostra o indicador *"Ben está digitando"*.
2. O request envia apenas a **última** mensagem do usuário (formato `{ messages: [{ role, parts: [{ type: 'text', text }] }] }`). O backend **lê só o texto da última mensagem do usuário** e ignora o histórico do payload.
3. O backend persiste a mensagem do usuário, gera a resposta do Ben (ver 4.2), cria as capturas (ver 4.3) e responde **JSON único** com o `AgentReply`.
4. O front cria a bolha do Ben e **anima o texto** da resposta caractere a caractere (efeito "typing"); se houve captura, renderiza o **capture card** dentro da bolha.

Regras de bloqueio do envio:

- Texto vazio (após `trim`) → ignorado.
- Já há uma resposta em andamento (`isAwaitingReply`) → ignorado.
- **Offline** → ignorado (ver 4.7).
- Em caso de erro de rede, `sendError` é marcado (estado de erro do envio).

> ⚠️ **A resposta de `/chat` é JSON, não streaming.** Os documentos descrevem uma rota de streaming com `useChat`; o código atual responde um objeto `AgentReply` completo. Ver seção 9.

### 4.2 Geração da resposta do agente (pipeline de 2 etapas + memória)

**Provider:** Google **Gemini `gemini-2.5-flash-lite`** via Vercel AI SDK, isolado em [project-backend/src/infra/services/gemini-agent-provider/index.ts](project-backend/src/infra/services/gemini-agent-provider/index.ts).

A geração tem **duas chamadas ao modelo**:

1. **Etapa de raciocínio/contexto** — `generateText` com o **system prompt do Ben** + a **memória de tópicos** ([system-prompt.ts](project-backend/src/infra/services/gemini-agent-provider/generate-reply/system-prompt.ts)). O agente recebe o índice de tópicos conhecidos e **pode chamar uma única vez** a ferramenta `get-history-context` ([history-context-tool.ts](project-backend/src/infra/services/gemini-agent-provider/generate-reply/history-context-tool.ts)) para buscar resumos de tópicos relevantes antes de responder (limite de 2 passos).
2. **Etapa de formatação** — `generateText` com o **format prompt** ([format-system-prompt.ts](project-backend/src/infra/services/gemini-agent-provider/generate-reply/format-system-prompt.ts)) que converte o texto livre da etapa 1 em um **objeto estruturado** validado pelo schema ([schemas.ts](project-backend/src/infra/services/gemini-agent-provider/generate-reply/schemas.ts)):

```ts
{
  message: string            // resposta em linguagem natural ao usuário
  newReminders: [{ title, remindAt?, notes? }]
  newNotes:     [{ title, body }]
  newTasks:     [{ title, contentType: 'text'|'todo', textContent?, todoItems? }]
  historyTopics:[{ topic, summary }]   // tópicos do turno, no formato kind:category:slug
}
```

**Memória de tópicos (testável):**

- Cada turno o Ben identifica `historyTopics` (chaves `kind:category:slug`, ex. `reminder:work:meeting`) e um resumo.
- Esses resumos são **persistidos** ([persist-topic-summaries.ts](project-backend/src/domain/use-cases/topics/persist-topic-summaries.ts)) e o índice de tópicos conhecidos é montado a cada novo turno ([build-topic-index.ts](project-backend/src/domain/use-cases/topics/build-topic-index.ts)).
- Em turnos seguintes, o agente reaproveita a chave existente e pode puxar o histórico daquele tópico via a tool. **Resultado esperado:** ao falar de novo sobre um assunto recorrente na mesma sessão, o Ben tem contexto do que foi dito antes (memória persiste só enquanto o servidor estiver de pé — repositório em memória).

### 4.3 Classificação e criação automática de capturas

**Fluxo:** [persist-captures.ts](project-backend/src/domain/use-cases/captures/persist-captures.ts).

- A classificação é **server-side**: o cliente nunca escolhe o tipo. A partir da mensagem, o Ben decide criar **notes**, **reminders** e/ou **tasks**.
- Para cada item do `AgentReply`, o backend cria o registro correspondente e devolve uma **`CaptureView`** `{ kind, itemId, title, meta }`.
- A **captura primária** (a que vira o card na bolha do Ben e fica vinculada à mensagem) é o **primeiro item**, na ordem **reminders → tasks → notes**. Ou seja, se um turno gera reminder + nota, o card exibido é o do **reminder**.
- Regras de criação:
  - **Task** nasce com `status: 'created'`, `messageId: null`. Se `contentType: 'todo'`, os `todoItems` (strings) viram itens com `done: false` e `order` sequencial.
  - **Reminder** guarda `title`, `remindAt` (opcional) e `notes` (opcional). O alarme é **mockado** — não dispara notificação.
  - **Note** guarda `title` e `body`.

### 4.4 Capture cards inline

**Componentes:** [capture-card/](project-web/src/pages/chat/components/capture-card/), renderizados em [chat-history.tsx](project-web/src/pages/chat/components/chat-history/chat-history.tsx).

- Quando a resposta do Ben traz uma captura, aparece um **card** dentro da bolha com ícone por tipo, título e (quando houver) `meta`.
- O card tem um botão de **ação** que navega para a **task workspace** (`/tasks/{itemId}`).

> ⚠️ **Limitação:** o link de ação aponta para a workspace de task para **qualquer tipo** de captura. Para **task** funciona. Para **note/reminder** leva a `/tasks/{id}`, que tenta carregar uma task inexistente e cai na tela de erro *"couldn't load this one"* — **não existe tela de detalhe de note/reminder hoje**.

### 4.5 Histórico de mensagens + paginação

**Endpoint:** **`GET /messages/list?limit=&cursor=`** ([list-messages.ts](project-backend/src/infra/http/routes/messages/list-messages.ts)). **Hooks:** [use-message-list-data.ts](project-web/src/layout/hooks/api/use-message-list-data.ts), [use-chat-messages.ts](project-web/src/pages/chat/hooks/use-chat-messages.ts).

Comportamento esperado:

- Ao abrir o chat, carrega a janela de mensagens (estado **Loading** → skeleton → **Populated**). Cada mensagem resolve a captura associada (se houver) para reexibir o card.
- **Scroll para o topo** dispara paginação por **cursor** (`hasMore` / `nextCursor`) — carrega mensagens mais antigas.
- Mensagens do histórico são mescladas com as mensagens da **sessão atual** (otimistas).
- Estado **vazio**: se não há mensagens e não há captura de voz em andamento, mostra a tela de empty state ([chat-empty-state](project-web/src/pages/chat/components/chat-empty-state/chat-empty-state.tsx)).

### 4.6 Captura por voz (gravar → transcrever → enviar)

**Endpoint:** **`POST /transcription`** (multipart, campo `audio`) ([transcription.ts](project-backend/src/infra/http/routes/transcription.ts), provider **AssemblyAI**). **Store:** [voice-store](project-web/src/layout/stores/voice-store/index.ts).

Fluxo e estados esperados:

1. O usuário inicia a gravação (mic). Requer **permissão de microfone** e estar **online**.
2. Durante a gravação, há um contador de segundos (`recordingSeconds`); estado **recording**.
3. Ao parar, o áudio (`webm`) é enviado para `POST /transcription`; estado **transcribing** (bolha de usuário "pendente").
4. O backend transcreve via AssemblyAI e devolve `{ text }`.
5. O texto transcrito é **injetado no mesmo fluxo de envio de texto** (`sendText`) — ou seja, voz vira texto e segue o caminho do chat normal (4.1).
6. **Erro de transcrição:** estado **error** → bolha *"couldn't catch that — tap to retry or type it instead"* com retry.
7. **Cancelar:** durante gravação/transcrição o usuário pode cancelar; um `transcriptionRunId` garante que resultados de gravações abandonadas sejam descartados.

> ⚠️ Não existe a rota `POST /messages/create-audio` dos docs. A transcrição é uma **etapa separada** (`/transcription`) cujo texto alimenta o `/chat`.

### 4.7 Conectividade / offline

**Hook/store:** [use-connectivity.ts](project-web/src/layout/hooks/use-connectivity.ts), [connectivity-store.ts](project-web/src/layout/stores/connectivity-store.ts), banner em [chat-top-banner](project-web/src/pages/chat/components/chat-top-banner/chat-top-banner.tsx).

- O app detecta estado **offline** e exibe um banner no topo do chat.
- **Offline bloqueia** o envio de texto e o início de gravação de voz.

---

## 5. Active task picker (peek de tasks no chat)

**Componentes:** [active-task-picker.tsx](project-web/src/pages/chat/components/task-picker/active-task-picker.tsx), [active-task-peek.tsx](project-web/src/pages/chat/components/active-task-peek.tsx). **Endpoint:** **`GET /tasks/list?status=active`** ([list-tasks.ts](project-backend/src/domain/use-cases/tasks/list-tasks.ts)).

Comportamento esperado:

- Acima do composer do chat, um **peek** mostra as tasks ativas. `status=active` retorna **tudo que não está `finished`** (inclui `created` e `active`), ordenado por `lastActivityAt` desc.
- Estados: **skeleton** (carregando), **empty** (*"nothing in progress — Ben's listening"*) e **summary** (contagem + título mais recente).
- Abrir o picker lista as tasks; selecionar uma navega para a workspace (`/tasks/{id}`).
- Os itens da lista usam o presenter resumido (`id`, `title`, `contentType`, `status`, `hasPendingDiff`, `lastActivityAt`, `createdAt`).

---

## 6. Task workspace

**Tela:** [task-workspace/page.tsx](project-web/src/pages/task-workspace/page.tsx) (rota `/tasks/:taskId`).

É o segundo ambiente colaborativo com o Ben: você abre uma task, conversa numa sub-thread, o Ben **propõe mudanças** no conteúdo, e você **aprova ou rejeita**. Também dá para editar direto e finalizar.

### 6.1 Carregar a workspace

**Endpoint:** **`GET /tasks/:id/detail`** ([get-task-detail.ts](project-backend/src/infra/http/routes/tasks/get-task-detail.ts)).

- Uma única chamada traz a task inteira: `title`, `contentType`, conteúdo (`textContent` **ou** `todoItems`), `pendingDiff` (se houver), `status`, `summary`, datas.
- Estados: **loading** (*"loading your workspace…"*), **erro** (*"couldn't load this one"* com Retry / Back to chat) e **carregada**.
- Renderiza [TodoContent](project-web/src/pages/task-workspace/components/todo-content/todo-content.tsx) (se `contentType: 'todo'`) ou [TextContent](project-web/src/pages/task-workspace/components/text-content/text-content.tsx) (se `'text'`).

### 6.2 Sub-thread: conversar com o Ben dentro da task

**Endpoint:** **`POST /tasks/:id/messages/create`** (body `{ content }`) ([create-task-message.ts](project-backend/src/domain/use-cases/tasks/create-task-message.ts)). Aceita texto **ou voz** (mesma transcrição da seção 4.6).

Comportamento esperado:

1. O usuário manda uma mensagem no contexto da task. O backend chama `generateTaskTurn` do Gemini com o estado atual da task (título, conteúdo, summary).
2. O agente devolve `{ message, proposedChanges, updatedSummary }` ([schema](project-backend/src/infra/services/gemini-agent-provider/generate-task-turn/schemas.ts)).
3. Se houver `proposedChanges`, o backend monta um **`pendingDiff`** (embutido na task) e move o status para `active`. A resposta traz a task atualizada + `benMessage`.
4. O `updatedSummary` é salvo na task (memória curta da workspace).

### 6.3 Revisar e aprovar/rejeitar o diff do Ben

**Componente:** [diff-bar.tsx](project-web/src/pages/task-workspace/components/diff-bar/diff-bar.tsx). **Endpoints:** **`POST /tasks/:id/diff/approve`** e **`POST /tasks/:id/diff/reject`**.

- Quando há `pendingDiff`, aparece a **diff bar** com a proposta. Para `text`, mostra antes/depois; para `todo`, mostra itens marcados como `added` / `removed` / `unchanged`.
- **Aprovar** ([approve-task-diff.ts](project-backend/src/domain/use-cases/tasks/approve-task-diff.ts)):
  - `text` → aplica o `after` ao `textContent`.
  - `todo` → mantém os itens **exceto os `removed`** e descarta o diff.
  - Falha se não houver diff pendente (`NO_PENDING_DIFF`).
- **Rejeitar** ([reject-task-diff.ts](project-backend/src/domain/use-cases/tasks/reject-task-diff.ts)): limpa o `pendingDiff` sem alterar o conteúdo; a diff bar some.

### 6.4 Edição direta do conteúdo

**Endpoints:** **`POST /tasks/:id/content/update`** (body `{ textContent }`) e **`POST /tasks/:id/todos/update`** (body `{ todoItems }`).

- Edição de texto ([update-task-content.ts](project-backend/src/domain/use-cases/tasks/update-task-content.ts)) só vale para `contentType: 'text'`; edição de todos ([update-task-todos.ts](project-backend/src/domain/use-cases/tasks/update-task-todos.ts)) só para `'todo'` (validação `ensureTaskContentType`).
- **Regra de reconciliação:** qualquer edição direta **invalida e descarta** um `pendingDiff` existente (seta `pendingDiff: null`).
- Todos suportam toggle de `done`, edição de título, reordenação (`order`) e adição/remoção — o cliente envia o array atualizado.
- **No conteúdo de texto, o editor fica read-only quando há diff pendente** (resolva o diff antes de editar à mão).

### 6.5 Finalizar / reabrir

**Endpoints:** **`POST /tasks/:id/finish`** ([finish-task.ts](project-backend/src/domain/use-cases/tasks/finish-task.ts)) e **`POST /tasks/:id/reopen`** ([reopen-task.ts](project-backend/src/domain/use-cases/tasks/reopen-task.ts)).

- **Finish:** `status: 'finished'`, grava `finishedAt`. A task sai do peek/ativas e o conteúdo fica **read-only** na workspace.
- **Reopen:** volta para `active`, zera `finishedAt`, reabilita o composer.

> Toda rota de task valida **posse** (`loadOwnedTask` confere `userId`) — você só acessa suas próprias tasks.

---

## 7. Tabela de endpoints disponíveis (backend)

Fonte de verdade: [project-backend/src/infra/http/app.ts](project-backend/src/infra/http/app.ts). Todas exigem os dois headers de auth, **exceto** `/health` e `/auth/login-or-register`.

| Método | Rota | Função |
| --- | --- | --- |
| `GET` | `/health` | Healthcheck (`{ status: 'ok' }`) |
| `POST` | `/auth/login-or-register` | Login/registro via token Google → `{ process, user, accessToken }` |
| `GET` | `/messages/list?limit=&cursor=` | Histórico paginado por cursor |
| `POST` | `/chat` | Envia mensagem, gera resposta do Ben + capturas (JSON) |
| `POST` | `/transcription` | Transcreve áudio (multipart `audio`) → `{ text }` |
| `GET` | `/tasks/list?status=active\|finished` | Lista tasks |
| `GET` | `/tasks/:id/detail` | Detalhe completo da task |
| `POST` | `/tasks/:id/messages/create` | Turno de conversa na task → `{ item, benMessage }` |
| `POST` | `/tasks/:id/diff/approve` | Aplica o diff pendente |
| `POST` | `/tasks/:id/diff/reject` | Descarta o diff pendente |
| `POST` | `/tasks/:id/content/update` | Edita o texto da task |
| `POST` | `/tasks/:id/todos/update` | Edita a lista de todos |
| `POST` | `/tasks/:id/finish` | Marca como finalizada |
| `POST` | `/tasks/:id/reopen` | Reabre task finalizada |

---

## 8. Telas disponíveis (web)

Fonte: [project-web/src/core/router.tsx](project-web/src/core/router.tsx).

| Rota | Tela | Auth |
| --- | --- | --- |
| `/` | Login (Google) | Pública |
| `/chat` | Chat com o Ben | Protegida |
| `/tasks/:taskId` | Task workspace | Protegida |

---

## 9. Divergências em relação aos docs de planejamento

Os documentos em [docs/api-endpoints.md](docs/api-endpoints.md) e [docs/data-model.md](docs/data-model.md) descrevem o **plano v1**. O código atual já evoluiu/diverge em pontos importantes:

1. **`/chat` é JSON, não streaming.** Os docs descrevem streaming com `useChat`; o código persiste a mensagem, gera resposta e capturas, e responde um `AgentReply` único.
2. **`/chat` faz classificação de captura e memória.** Os docs marcam `/chat` como "reply-only"; na prática ele **cria notes/reminders/tasks** e mantém **memória de tópicos** persistida.
3. **Não existem** `POST /messages/create` nem `POST /messages/create-audio`. A criação acontece via `/chat`; a transcrição é a rota separada `/transcription`.
4. **Não existem** rotas de detalhe/listagem de **notes** e **reminders** (`/notes/...`, `/reminders/...`), nem `/sidebar/counts`, nem `/me/detail`. Logo, **não há menu sidebar, Notes view, Reminders view nem Settings** no web hoje.
5. **Persistência:** o modelo de dados fala em MongoDB; a implementação atual é **100% em memória** (perde tudo no restart).
6. **Sistema de tópicos/memória** (`topic`, `topic-summary`) existe no código, mas **não consta** como collection no `docs/data-model.md`.

---

## 10. Limitações conhecidas que afetam os testes

1. **Dados voláteis:** repositórios em memória — reiniciar o backend zera mensagens, capturas, tasks e tópicos.
2. **`UserRepository` duplicado:** instanciado separadamente em [login-or-register.ts](project-backend/src/infra/http/routes/auth/login-or-register.ts) e no [auth middleware](project-backend/src/infra/http/middlewares/auth.ts). Funciona enquanto o JWT é válido; a **reemissão por expiração** não acharia o usuário (repositório vazio) e falharia.
3. **Capture cards de note/reminder levam à workspace de task** e caem em erro — não há tela de detalhe própria para esses tipos.
4. **Reminders não disparam** — o alarme é mockado; `remindAt`/`status` são apenas dados.
5. **Dependência de chaves externas:** sem `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini) e `ASSEMBLYAI_API_KEY` (transcrição), o chat e a voz não funcionam.
6. **CORS restrito:** o web precisa rodar em `http://localhost:3001`.
7. **Determinismo do agente:** como o Ben é um LLM, a classificação e as propostas de diff **variam entre execuções** — testes de conteúdo devem considerar essa variabilidade.

---

## 11. Referências

- Endpoints planejados: [docs/api-endpoints.md](docs/api-endpoints.md)
- Modelo de dados: [docs/data-model.md](docs/data-model.md)
- Integração AssemblyAI: [docs/assemblyai-transcription.md](docs/assemblyai-transcription.md)
- Integração Vercel AI SDK + Gemini: [docs/vercel-ai-sdk.md](docs/vercel-ai-sdk.md)
- Fluxo de autenticação Google: [docs/google-auth.md](docs/google-auth.md)
- Design system: [docs/design.md](docs/design.md)
