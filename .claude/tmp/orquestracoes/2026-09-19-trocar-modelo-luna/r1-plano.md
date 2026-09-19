# Plano de implementação — trocar o modelo do agente Ben para `openai/gpt-5.6-luna`

Rodada 1 — planejador. Nada foi editado. O implementador (`sonnet`) executa o que está abaixo
sem decidir nada.

**Resumo em uma linha:** uma única string muda, em uma única linha, em um único arquivo.

---

## 1. Diff pretendido, arquivo por arquivo

### Arquivo único: `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/models.ts`

**Linha 15.**

Texto exato ANTES:

```ts
export const openRouterModel = openrouter('openai/gpt-oss-120b', {
```

Texto exato DEPOIS:

```ts
export const openRouterModel = openrouter('openai/gpt-5.6-luna', {
```

É o arquivo inteiro do diff. Nada mais muda: nem os imports (linhas 1-3), nem o client
`google` (5-7), nem `geminiModel` (9), nem o client `openrouter` (11-13), nem o bloco
`extraBody` (16-22), nem os comentários inline. Uma linha, uma string.

**Nenhum outro arquivo é tocado.** Não criar arquivo, não renomear, não mover, não dividir o
serviço em pasta (o design *Service Structure* só se aplica quando o arquivo cresce — não é
o caso, e reorganizar aqui seria inflar a task).

---

## 2. Verificação do id no catálogo do OpenRouter

**Sem divergência: o slug `openai/gpt-5.6-luna` existe exatamente com esse texto.**

Verificado por chamada direta ao catálogo (`curl https://openrouter.ai/api/v1/models`,
HTTP 200, 739.854 bytes, filtrado por `.data[].id`) em 2026-09-19. A resposta traz, na
família 5.6:

```
openai/gpt-5.6-luna          <- o que vai no código
openai/gpt-5.6-luna:batch
openai/gpt-5.6-luna-pro
openai/gpt-5.6-terra  /  openai/gpt-5.6-sol  (+ variantes -pro e :batch)
```

Ficha do modelo, confirmada no mesmo payload (bate com o `r0-recon-doc.md`):

- `canonical_slug`: `openai/gpt-5.6-luna-20260709` — **não usar**; o alias estável é o que vai
  no código, como já era com o `gpt-oss-120b`.
- `context_length`: 1.050.000 · `max_completion_tokens`: 128.000 · `knowledge_cutoff`: 2026-02-16
- `pricing`: prompt US$ 0,20/M · completion US$ 1,20/M · cache read US$ 0,02/M
  (override de 2x input / 1,5x output acima de 272K tokens de prompt)
- `supported_parameters`: `tools`, `tool_choice`, `structured_outputs`, `response_format`,
  `reasoning`, `reasoning_effort`, `max_tokens`, `max_completion_tokens`, `seed`,
  `include_reasoning`
- `reasoning`: não é mandatório, vem habilitado por padrão, `default_effort: "medium"`
- `default_parameters`: `temperature`, `top_p`, `top_k`, penalidades — todos `null`

Os dois parâmetros de que o código depende hoje — `tools`/`tool_choice` (em `generateReply`)
e `structured_outputs`/`response_format` (nos dois `Output.object`) — **estão na lista de
suportados**. A troca não exige mudança nenhuma em `index.ts`.

Não passar `reasoning_effort`: o código não passa nada hoje, o default do modelo já é `medium`,
e adicionar parâmetro é escopo que o usuário não pediu.

---

## 3. Compatibilidade do bloco `extraBody.provider`

Endpoints que o OpenRouter tem para esse modelo
(`GET /api/v1/models/openai/gpt-5.6-luna/endpoints`, HTTP 200, 2026-09-19):

| provider | tag | suporta `response_format` / `structured_outputs`? |
|---|---|---|
| OpenAI | `openai`, `openai/fast`, `openai/flex` | sim |
| Azure | `azure`, `azure/us`, `azure/eu` | sim |
| Amazon Bedrock | `amazon-bedrock/us-east-1` | **não** |

**Recomendação: MANTER o bloco exatamente como está.** Linha a linha:

- `require_parameters: true` — **manter, e agora ele é mais importante que antes**: o endpoint
  do Amazon Bedrock não suporta `response_format`/`structured_outputs`, e o agente depende de
  `Output.object` nas duas operações; é essa flag que impede o roteamento de cair nele e
  quebrar a resposta estruturada.
- `ignore: ['cerebras']` — **manter**: a Cerebras não serve esse modelo (só OpenAI, Azure e
  Bedrock servem), então a entrada virou um no-op inofensivo; removê-la é mexer em preferência
  de roteamento que o usuário não pediu, com ganho zero. **Divergência registrada, não corrigida
  em silêncio:** se o revisor quiser a limpeza, é uma decisão dele, não uma consequência da troca.
- `sort: 'throughput'` — **manter**: é preferência de roteamento, ortogonal ao modelo.

---

## 4. Varredura por `gpt-oss-120b` no repo

Duas buscas independentes, ambas excluindo `node_modules`, `.git`, `dist`, `.expo` e
`.claude/tmp`, nos três subprojetos:

1. `grep -rn -i -e 'gpt-oss' -e 'gpt_oss' -e '120b'` na árvore de trabalho
2. `git grep -n -i -e 'gpt-oss' -e '120b'` nos arquivos versionados

Resultado idêntico e único nas duas:

```
project-backend/src/infra/services/ben-agent-provider/models.ts:15
```

**Não existe nenhuma outra ocorrência de `gpt-oss-120b` no repositório.** Nada em
`project-mobile`, nada em `project-design`, nada em `.env.example`, nada em doc, nada em
`.claude/skills`, nada em teste (o backend não tem teste algum). A linha 15 do `models.ts` é o
começo e o fim da mudança.

Confirmado também que a árvore está limpa (`git status --short` sem saída) na branch
`feat/update-model-and-add-logs` — o implementador começa de um estado sem ruído.

---

## 5. Como provar

### 5.1 Lint e typecheck (obrigatórios, nessa ordem)

```bash
cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix
cd /root/so/repos/ben-prototype/project-backend && npx tsc --noEmit
```

(`lint:fix` = `eslint ./src --ext .ts --fix`, conforme `project-backend/package.json`.)

Critério: os dois terminam com exit 0 e sem erro. A mudança é uma string literal — qualquer
erro que aparecer é pré-existente ou foi introduzido por edição acidental; nesse caso, comparar
com `git diff` e garantir que o diff tem **uma linha alterada e nenhuma outra**.

Verificação do diff antes de commitar:

```bash
cd /root/so/repos/ben-prototype && git diff --stat
# esperado: 1 file changed, 1 insertion(+), 1 deletion(-)
```

### 5.2 Teste de browser

Subir os dois lados:

```bash
cd /root/so/repos/ben-prototype/project-backend && npm run dev   # porta = API_PORT do .env
cd /root/so/repos/ben-prototype/project-mobile  && npm start     # expo, web em :8081
```

O que o tester tem que **ver**, e nada além disso:

1. O app abre em `http://localhost:8081` sem erro de bundle.
2. Na tela de chat, enviar uma mensagem de texto curta (ex.: "oi, tudo bem?") pelo composer.
3. **Chega uma resposta do Ben na tela** — bolha de resposta renderizada, sem banner de erro e
   sem 500 no `POST /chat`. É isso que prova que o `openai/gpt-5.6-luna` respondeu pelo
   OpenRouter: o `Output.object` do backend só produz resposta válida se o modelo existir,
   o roteamento tiver achado provider e o structured output ter vindo no schema.
4. No terminal do backend, a requisição não derruba o processo nem loga erro do provider.

Sinais de falha e o que significam:

- `404` / "No endpoints found for model" vindo do OpenRouter → slug errado no código (revisar a
  linha 15 caractere a caractere contra `openai/gpt-5.6-luna`).
- `401` do OpenRouter → `OPENROUTER_API_KEY` do `.env`, não a troca de modelo.
- Erro de schema/`Output.object` → checar se o provider roteado suporta structured outputs,
  isto é, se o `require_parameters: true` continua no `extraBody`.

**Risco conhecido do passo de browser (não confirmado):** a autenticação do mobile é Google
Sign-In via Firebase e ambos os endpoints de LLM (`POST /chat` e
`POST /tasks/:id/messages/create`) exigem `authMiddleware` com JWT. Não encontrei nenhum atalho
de login de desenvolvimento no repo (busca por `DEV_`, `bypass`, `fake auth` em
`project-mobile/src/pages/login`, `project-mobile/src/core` e nos middlewares do backend: nada).
**Não confirmado** que o Google Sign-In completa em browser headless. Se o tester travar no
login, isso é um obstáculo de ambiente, **não uma falha da troca de modelo**: ele deve reportar
ao orquestrador em vez de inventar credencial, criar rota de teste ou desligar o middleware.

---

## 6. Riscos e o que NÃO fazer

Copiado do briefing (seção "Fora do escopo"), mais o que a investigação desta rodada acrescenta.

**Fora do escopo — não fazer, mesmo que pareça uma boa ideia:**

- Não adicionar log, telemetria, nem o nome do modelo em log — **apesar do nome da branch**
  (`feat/update-model-and-add-logs`). O usuário pediu só a troca.
- Não migrar para o provider OpenAI direto; não criar `OPENAI_API_KEY`.
- Não remover nem mexer no `geminiModel` (código morto, linha 9).
- Não criar teste automatizado.
- Não transformar o model id em variável de ambiente.
- Não abrir PR (commit e push na branch atual, só isso).

**Acrescentado por esta rodada:**

- Não trocar o alias pelo snapshot `openai/gpt-5.6-luna-20260709`.
- Não usar `openai/gpt-5.6-luna-pro` nem `:batch` — são modelos/rotas diferentes.
- Não adicionar `reasoning_effort`, `temperature`, `maxOutputTokens` nem qualquer parâmetro de
  geração: hoje não existe nenhum no código.
- Não mexer no `extraBody` (ver seção 3) — incluindo o `ignore: ['cerebras']`, que hoje é no-op.
- Não dividir `ben-agent-provider` em mais arquivos nem "aproveitar para" refatorar.
- Não reformatar o arquivo: o `lint:fix` roda, mas o diff final tem que ser de uma linha.

**Riscos reais da mudança:**

- **Custo e latência mudam de patamar** (modelo proprietário pago vs. OSS). Fora do escopo agir
  sobre isso; registrado para o usuário saber.
- **`reasoning` vem habilitado por padrão** (`default_enabled: true`, effort `medium`), o que pode
  deixar a primeira resposta mais lenta que a do `gpt-oss-120b`. Não é erro; não tratar.
- **Roteamento restrito a 3 provedores** (OpenAI, Azure, Bedrock) e, com `require_parameters: true`
  + structured outputs, na prática OpenAI e Azure. `sort: 'throughput'` tem menos margem de
  escolha do que tinha. Esperado, não é problema.

---

## Premissas assumidas (nenhuma pergunta foi feita, conforme a regra da rodada)

1. "Trocar o modelo" = trocar só o `openRouterModel`. O `geminiModel` fica intacto, como manda o
   briefing.
2. O alias `openai/gpt-5.6-luna` é o id correto, e não o snapshot datado — é o padrão que o
   arquivo já seguia (`openai/gpt-oss-120b`, também alias).
3. Manter o `ignore: ['cerebras']` apesar de virar no-op: a premissa do briefing manda manter, e
   não achei motivo forte para contrariar. A divergência está registrada na seção 3 para o revisor.
4. O teste de browser usa o fluxo de chat (`POST /chat`), não o de task workspace: é o caminho mais
   curto que exercita o mesmo `openRouterModel`.
