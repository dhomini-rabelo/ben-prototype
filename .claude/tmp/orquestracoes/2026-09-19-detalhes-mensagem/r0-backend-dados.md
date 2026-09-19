# R0 — Dados existentes sobre input/output do agente Ben (backend)

Investigação read-only em `/root/so/repos/ben-prototype/project-backend`. Premissas assumidas por falta de esclarecimento do usuário (documentadas, não perguntadas): "input" = o que é enviado ao modelo (system/prompt/tools/histórico); "output" = o que o modelo devolve (texto, tool calls, usage, modelo, latência); "por mensagem" = associável a um registro de `Message` específico.

## 1. Agent provider — o que é montado como input e o que volta como output

Arquivo: `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/index.ts`
Porta: `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-provider.ts`

`BenAgentProviderService.generateReply` faz **duas** chamadas `generateText` (da lib `ai`):
- 1ª chamada: `system: buildSystemPrompt(topicIndex)`, `prompt: payload.message`, `tools: { 'get-history-context': ... }`, `toolChoice: 'auto'`, `stopWhen: stepCountIs(2)`. Retorna `contextResult` com campos `toolCalls`, `toolResults`, `text` (usados só internamente).
- 2ª chamada: `system: buildFormatSystemPrompt()`, `prompt: contextResult.text`, `output: Output.object({ schema: agentReplySchema })`. Retorna `result.output` (tipado `AgentReply`: `message`, `newReminders`, `newNotes`, `newTasks`, `historyTopics`).

`generateTaskTurn` faz uma única chamada `generateText` equivalente para o fluxo de tarefas (`TaskTurnReply`: `message`, `proposedChanges`, `updatedSummary`).

**O objeto `generateText` da lib `ai` expõe nativamente** (não usado hoje, mas disponível no retorno): `usage` (tokens), `finishReason`, `response.modelId`, `response.id`, `warnings`, `providerMetadata`, `toolCalls`, `toolResults`, `text`. Nenhum desses é capturado nem persistido — só `text`/`output` seguem adiante.

Veredito: o **input completo (system+prompt+tools+histórico)** existe apenas como argumentos de função dentro de `generateReply`/`generateTaskTurn`, montado a cada chamada — nunca é serializado nem guardado. O **output bruto do modelo** (usage, tool calls, model id, latência) é descartado após a chamada; só o texto/objeto final segue para persistência de negócio.

## 2. Commits recentes e branch atual — "logs"

`git log --stat -3` (rodado em `/root/so/repos/ben-prototype`):
- `a544d65` — só documentação (`.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/*`), nenhum código.
- `255bd80` — troca 1 linha em `src/infra/services/ben-agent-provider/models.ts` (id do modelo OpenRouter `openai/gpt-oss-120b` → `openai/gpt-5.6-luna`). Nenhum log adicionado.
- `9822e36` — só workflow de deploy (`.github/workflows/deploy.yml`).

`git diff main..HEAD --stat`: o branch `feat/update-model-and-add-logs` só contém os arquivos de docs da orquestração de troca de modelo + a linha de `models.ts`. **Nenhum código de "logs" foi adicionado neste branch** apesar do nome sugerir isso — a parte "add-logs" do branch ainda não foi implementada.

Os únicos `console.log` existentes no agent provider (`'[ben-agent] tool calls:'`, `'[ben-agent] tool results:'`, `'[ben-agent] context text:'`, `'[ben-agent] reply output:'` em `index.ts` linhas 33-55) são **anteriores** a este branch — `git blame` mostra commit `3e617145` de 2026-06-06, comentados como `// keeping for debugging`. São `console.log` simples: vão para stdout do processo, não para arquivo nem banco, não têm nenhuma associação com o id da `Message` persistida, e não sobrevivem a restart (não há redirecionamento/coleta configurado que se tenha encontrado no repo).

Veredito: hoje **não existe nenhum log estruturado ou persistido por mensagem**; existe apenas debug ad-hoc em stdout, desconectado da entidade `Message`.

## 3. Entidade `Message` e repositório — o que é persistido

Arquivo: `/root/so/repos/ben-prototype/project-backend/src/domain/entities/message.ts`

`MessageProps`:
```
userId: ID
role: 'user' | 'ben'
content: string
capture: { kind: 'note'|'reminder'|'task', itemId: ID } | null
createdAt: Date
```

Não existe nenhum campo `metadata`, `rawInput`, `rawOutput`, `usage`, `model`, `latency`, `toolCalls` em `MessageProps`, no `Message` entity, no `MessageRepository` (`src/adapters/repositories/message-repository.ts`) nem nas implementações (`src/infra/services/repositories/in-memory-message-repository.ts`, `.../sqlite-message-repository.ts`).

Schema Prisma (`/root/so/repos/ben-prototype/project-backend/prisma/schema.prisma`): tabela `messages` tem só `id`, `props` (JSON serializado de `MessageProps`), `types` — é o padrão genérico do projeto (toda entidade serializa `props` como string JSON). Ou seja, mesmo no sqlite, só o que está em `MessageProps` acima é gravado.

Veredito: **NÃO existe** persistência de input/output do modelo por mensagem, nem em memória nem no sqlite — apenas o texto final (`content`), papel (`role`), captura associada e timestamp.

## 4. Rotas HTTP de mensagens/chat e presenters — o que o mobile recebe hoje

- `POST /chat` → `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/chat.ts`: recebe `{ messages: [{ role, parts: [{type, text}] }] }`, extrai a última mensagem do usuário, persiste, chama o agente, persiste captures e a resposta do Ben, e devolve via `AgentReplyPresenter.toHttp(reply, primaryCapture)` — presenter não lido em detalhe aqui, mas o payload de entrada (`reply`) é `AgentReply` (`message`, `newReminders`, `newNotes`, `newTasks`, `historyTopics`); não inclui usage/tool calls/model.
- `GET /messages` (lista) → `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/messages/list-messages.ts`, formatado por `/root/so/repos/ben-prototype/project-backend/src/infra/http/presenters/message-presenter.ts`. Campos devolvidos por mensagem: `id`, `role`, `content`, `capture` (objeto resolvido via `ResolveCaptureUseCase`, ou `null`), `createdAt` (ISO string). **Não devolve `userId`** (removido via `Omit`). Não há campo de usage/model/input bruto — porque eles não existem na entidade.
- `POST /tasks/:id/messages` → `create-task-message.ts`: devolve `{ item: <task>, benMessage: <TaskTurnReply> }`, mesma limitação.

Veredito: o mobile recebe hoje, por mensagem, apenas `id`, `role`, `content`, `capture`, `createdAt`. Nada de input do modelo, tool calls, usage, model id ou latência — porque esses dados nunca chegam a ser persistidos (ver seção 3).

## 5. Persistência — o que sobrevive a um restart

Configuração: `/root/so/repos/ben-prototype/project-backend/src/infra/services/env.ts` (`PERSISTENCE_DRIVER: 'in-memory' | 'sqlite'`, default `'in-memory'`) e seleção em `/root/so/repos/ben-prototype/project-backend/src/infra/http/repositories.ts` (`useSqlite = env.PERSISTENCE_DRIVER === 'sqlite'`). `.env.example` traz `PERSISTENCE_DRIVER=in-memory` e `DATABASE_URL=file:./prisma/dev.db`.

- Driver `in-memory` (default local): `InMemoryMessageRepository` — dados somem a cada restart do processo.
- Driver `sqlite` (usado em produção, ver commits `617b83e`…`2f90364`): `SqliteMessageRepository` grava na tabela `messages` (arquivo `prisma/dev.db` ou o que `DATABASE_URL` apontar) — sobrevive a restart, mas só com os campos de `MessageProps` (seção 3); nenhum input/output bruto do modelo é gravado em nenhum dos dois drivers, porque a entidade nunca carrega esses dados.

## Veredito geral

**NÃO existe** hoje nenhum dado de input (prompt/system/tools enviados ao modelo) ou de output bruto (usage, tool calls, model id, latência) associado a uma mensagem específica — nem em memória, nem no sqlite, nem exposto por HTTP. O único vestígio é `console.log` solto em stdout (pré-existente, não relacionado a este branch), sem vínculo com o id da `Message` e sem persistência.

Para o mobile conseguir buscar isso por mensagem, seria necessário: (a) capturar os dados desejados (`usage`, `toolCalls`, `response.modelId`, prompts montados) dentro de `BenAgentProviderService.generateReply`/`generateTaskTurn`; (b) adicionar um campo (ex.: `metadata` ou `debugInfo`) em `MessageProps`, propagando pelas duas implementações de repositório e pelo schema/migração Prisma; (c) preencher esse campo nos use-cases `PersistBenMessageUseCase`/`PersistUserMessageUseCase` (chamados em `chat.ts`); (d) incluir o campo em `MessagePresenter.toHttp` para expor via `GET /messages`. Nenhuma dessas peças existe hoje.
