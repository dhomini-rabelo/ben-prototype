# Recon — como o projeto define o modelo de LLM hoje

Branch atual: `feat/update-model-and-add-logs` (idêntica a `main`, sem diffs — nenhum trabalho de troca de modelo ou logs foi commitado ainda).

## 1. IDs de modelo hardcoded (todos os lugares encontrados)

Único arquivo no repo inteiro (backend, mobile, design, docs, .env.example, README) que contém um model id literal:

- `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/models.ts`
  - linha 9: `export const geminiModel = google('gemini-2.5-flash-lite')`
  - linha 15: `export const openRouterModel = openrouter('openai/gpt-oss-120b', { ... })`

Não há mais nenhuma ocorrência de `gpt-`, `claude-`, `gemini-` em `.ts/.tsx/.js/.json/.md/.env*` em nenhum dos 3 subprojetos (busca recursiva, excluindo `node_modules`). Não existe README na raiz do repo nem no backend. Não há seeds com model id.

**`geminiModel` está definido mas não é usado em lugar nenhum** (grep por `geminiModel` só retorna a própria declaração) — é código morto/alternativa não conectada.

## 2. SDK/cliente usado para chamar o LLM

- Vercel AI SDK (pacote `ai`, v6) — função `generateText` / `Output.object`, importada em `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/index.ts` (linha 8).
- Providers plugados nessa SDK, ambos em `models.ts`:
  - `@ai-sdk/google` (`createGoogleGenerativeAI`) → Gemini direto na Google.
  - `@openrouter/ai-sdk-provider` (`createOpenRouter`) → OpenRouter, que hoje serve o modelo `openai/gpt-oss-120b` (não é OpenAI direto, é o OSS 120b via OpenRouter).
- Não há chamada HTTP manual/fetch direto a nenhum provider — tudo passa pelo AI SDK.
- Chave usada em produção: `openRouterModel` (ver item 3). `geminiModel` existe como client configurado mas nunca instanciado num `BenAgentProviderService`.

## 3. Como o modelo é configurado

- **Modelo em si**: constante hardcoded em código (`models.ts`, linhas 9 e 15), não vem de env var nem de arquivo de config. Não existe `MODEL_NAME`/`LLM_MODEL` em `env.ts` nem em `.env.example`.
- **Credenciais** (não o modelo): vêm de env, validadas por Zod em `/root/so/repos/ben-prototype/project-backend/src/infra/services/env.ts`:
  - linha 20: `GOOGLE_GENERATIVE_AI_API_KEY: z.string()`
  - linha 21: `OPENROUTER_API_KEY: z.string()`
  - Refletidas em `.env.example` (`/root/so/repos/ben-prototype/project-backend/.env.example`, linhas 8-9) com placeholders `your-gemini-api-key` / `your-openrouter-api-key`.
- **Fallback/default**: não existe. Se a env var de API key faltar, o `safeParse` falha e o processo lança `Error('Invalid environment variables!')` (env.ts linhas 29-32) — mas isso é fallback de credencial, não de modelo. Não há lógica de "se X falhar, tenta modelo Y".
- **Quem decide qual client (`geminiModel` vs `openRouterModel`) é usado**: é escolha estática no código de cada route, via import direto:
  - `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/chat.ts` linha 18 (import) e linha 39: `const agentService = new BenAgentProviderService(openRouterModel)`
  - `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/tasks/create-task-message.ts` linha 5 (import) e linha 12: `new BenAgentProviderService(openRouterModel)`
  - `BenAgentProviderService` (index.ts linha 17) recebe o `LanguageModel` via construtor — é injeção de dependência simples, não factory/config dinâmica.

## 4. Parâmetros passados na chamada ao LLM

Tudo em `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/index.ts`:

- `generateReply` (linhas 20-31 e 44-49): `system`, `prompt`, `tools` (só na 1ª chamada, `get-history-context`), `toolChoice: 'auto'`, `stopWhen: stepCountIs(2)` na 1ª chamada; `output: Output.object({ schema: agentReplySchema })` na 2ª chamada.
- `generateTaskTurn` (linhas 63-68): `system`, `prompt`, `output: Output.object({ schema: taskTurnReplySchema })`.
- Parâmetro extra só no provider OpenRouter, em `models.ts` linhas 16-22: `extraBody.provider = { sort: 'throughput', ignore: ['cerebras'], require_parameters: true }` — é configuração de roteamento de provider do OpenRouter, não parâmetro de geração.
- **Não há** `temperature`, `max_tokens`/`maxOutputTokens`, `topP`, nem parâmetro de "reasoning effort" em lugar nenhum do backend (grep confirmado, zero ocorrências). Tudo roda nos defaults do AI SDK/provider.

## 5. Log/telemetria do nome do modelo

- Existem `console.log` de debug em `index.ts` (linhas 34-42 e 51-55), mas eles logam `toolCalls`, `toolResults`, `contextResult.text` e `result.output` — **nenhum loga o nome/id do modelo** usado na chamada. Comentário no código: `// keeping for debugging`.
- Fora isso, único outro log do backend é `console.log('Server is running on port ${env.API_PORT}')` em `server.ts` linha 6 — não relacionado a modelo.
- Não existe nenhum logger estruturado (pino/winston) nem campo `model` em nenhum objeto logado. Dado o nome do branch (`add-logs`), este é provavelmente o gap a preencher: hoje não há como saber, pelos logs, qual modelo respondeu.

## 6. Teste automatizado que fixa o nome do modelo

- **Não existe nenhum teste automatizado no backend.** Busca por `*.test.ts`/`*.spec.ts` em `project-backend` não retornou nenhum arquivo. (O "smoke script" do commit `b7738ff` é sobre o driver sqlite, não sobre o agente/modelo — não verifiquei o conteúdo desse script pois é fora do escopo de modelo, mas ele não aparece nas buscas por model id/temperature.)
- Logo: não há teste para atualizar/quebrar ao trocar o modelo.

## 7. Como rodar localmente / endpoint que exercita o LLM

- **Backend**: `/root/so/repos/ben-prototype/project-backend`, comando `npm run dev` → `NODE_ENV=development tsx watch ./src/infra/http/server.ts` (package.json linha 7). Porta vem de `env.API_PORT`; `.env.example` linha 1 define `API_PORT=3333` como valor de exemplo (não há default no schema Zod — `API_PORT: z.coerce.number()` sem `.default()`, então é obrigatório via `.env`).
- **CORS liberado** (`app.ts` linhas 33-43) para `http://localhost:3001` e `http://localhost:8081`, além de `https://dev-dhomini.remktos.com`.
- **Mobile** (cliente que efetivamente aciona o LLM): `/root/so/repos/ben-prototype/project-mobile`, comando `npm start` → `expo start`. A URL do backend vem de `extra.backendUrl` via `expo-constants` (`/root/so/repos/ben-prototype/project-mobile/src/core/env.ts`), configurada fora do código-fonte (app config/eas), não hardcoded.
- **Endpoints que exercitam o LLM** (registrados em `/root/so/repos/ben-prototype/project-backend/src/infra/http/app.ts`):
  - `POST /chat` (linha 53) → tela de chat do mobile → `BenAgentProviderService.generateReply`.
  - `POST /tasks/:id/messages/create` (linha 62) → tela de task workspace → `BenAgentProviderService.generateTaskTurn`.
  - Ambos exigem `authMiddleware` (JWT).

## Premissas assumidas (não há ambiguidade real de código, mas registro por transparência)

- Assumi que "o modelo que o projeto usa hoje" = `openRouterModel` (`openai/gpt-oss-120b`), por ser o único efetivamente instanciado nas rotas. `geminiModel` é tratado como client configurado mas não utilizado — não como "modelo em produção alternativo".
- Não abri o script de smoke do sqlite (`b7738ff`) nem os arquivos de `project-design`/`project-mobile` além do necessário para o item 7, por estarem fora do escopo "qual LLM o projeto usa".
