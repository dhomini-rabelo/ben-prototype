# r8 — Teste no browser: "configurar modelo e effort do agente Ben"

Executado ao pé da letra o roteiro de `r3-plano-v2.md` (`## Plano de teste`, linha 748 até o fim
da seção). Ambiente: backend (3333) e mobile (8081) já estavam de pé; usei-os como estavam,
reiniciando o backend só quando o roteiro pedia (passos 2 e 6). Viewport 390×844 durante todo o
teste. Screenshots em
`/tmp/claude-1000/-root-so-repos-ben-prototype/6938fb42-3615-45c5-a0ca-23839ef30716/scratchpad/screenshots/`.

## Ambiente e autenticação

- `curl /health` → 200, `curl :8081` → 200, sem precisar subir nada.
- Rodei `seed-ambiente.ts` (pasta `2026-09-19-detalhes-mensagem`) para gerar JWT e garantir o
  usuário de teste (`providerId: dev-seed-provider-id`, já existia, reaproveitado).
- No browser: `localStorage.setItem('ben.jwttoken', <JWT>); location.reload()`. O app abriu direto
  em `/chat` (auto-redirect confirmado, inclusive depois em dois reloads adicionais no passo 2/6/7).

## Passo a passo do roteiro

### 1. DoD 1 — escolher modelo e effort, lista de effort mudando conforme o modelo
**Resultado: passou, com uma ressalva na narração do roteiro (não é falha da DoD — ver nota).**

- Estado inicial: `GPT-5.6 Luna` marcado, `Effort` com 6 chips (`none low medium high xhigh max`),
  `medium` marcado. Screenshot 01.
- Cliquei `DeepSeek V4.1 Flash` → 3 chips (`low high max`), `high` marcado (default do deepseek,
  porque `medium` não existe lá). Screenshot 02. Bate com o roteiro.
- Cliquei `GLM 5.3 Flash` (vindo de DeepSeek+`high`) → 3 chips (`low high max`), **sem** o chip
  `none` (prova direta de "só o que cada modelo suporta"/`reasoning.mandatory`), mas o selecionado
  ficou **`high`**, não `max` como o roteiro narrou. Screenshot 03.
  - **Nota sobre a discrepância**: não é bug. A premissa do briefing diz "ao trocar de modelo, se o
    effort atual não existir no novo modelo, cai no default_effort do novo modelo" — isto é, o
    effort só reseta para o default quando o effort atual é inválido no novo modelo; caso contrário
    é mantido. Como `high` é válido tanto em DeepSeek quanto em GLM, o comportamento correto é
    manter `high`, não pular para o `max` (default do GLM). Confirmei essa regra duas vezes mais
    depois no teste: DeepSeek+`max` → GLM manteve `max` (screenshot 07); GLM+`max` → Luna manteve
    `max` (screenshot 17, `max` é válido em Luna). A narração do roteiro (`selecionado max`) parece
    ter assumido um reset incondicional para o default do modelo alvo, o que contradiz a própria
    premissa do briefing. Reportando para o time decidir se a premissa/roteiro precisam de ajuste
    de texto — a implementação está consistente com a premissa escrita.
- Voltei para `DeepSeek V4.1 Flash` e cliquei o chip `max`. Screenshot 04.

### 2. DoD 2 — persistência por usuário no backend
**Passou.**

- `curl /agent-preferences/detail` → `{"item":{"modelSlug":"deepseek/deepseek-v4.1-flash","effort":"max",...}}`.
- Reiniciei o backend (`pkill -f "tsx watch..."` + `npm run dev`), recarreguei a página, reabri
  Settings: `DeepSeek V4.1 Flash` + `max` continuavam marcados. Screenshot 05.
- Rejeição de par inválido:
  `curl -X POST /agent-preferences/update -d '{"modelSlug":"z-ai/glm-5.3-flash","effort":"medium"}'`
  → `400 {"effort":["UNSUPPORTED_AGENT_EFFORT#undefined"]}`, exatamente como o roteiro previa.

### 3. DoD 2 (parte 2) — reabrir o sheet sem recarregar a página
**Passou.**

- Com `DeepSeek V4.1 Flash` + `max` salvos, fechei o sheet no X (mesma página, sem reload) e
  reabri `Settings` dentro de 1 minuto: continuou marcando `DeepSeek V4.1 Flash` + `max`.
  Screenshot 06. `invalidate()` funcionando — não regrediu para `GPT-5.6 Luna`.
- Repeti trocando para `GLM 5.3 Flash`, fechando e reabrindo sem reload: continuou marcando
  `GLM 5.3 Flash` + `max`. Screenshot 07.

### 4. Semear task
**Passou.**

- Criei `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/seed-task.ts`, seguindo os
  mesmos moldes de `seed-ambiente.ts` (import por caminho absoluto de
  `SqliteUserRepository`/`SqliteTaskRepository`, todos os campos de `TaskProps`).
- Rodei: `taskId: 0688632a-1a2b-4474-b78f-d8a0fee28b90`.
- `curl /tasks/list` → a task aparece na listagem (`"title":"Task semeada para o teste de
  modelo/effort"`). A task também apareceu no app (menu → Tasks → "1 active").

### 5. DoD 3 e 4 — mensagem usa modelo/effort escolhidos; trace mostra os dois
**Passou — sem `OPENROUTER_API_KEY` real no ambiente, usei as três provas substitutas do roteiro
(a, b, c), como o próprio roteiro define como caminho principal.**

**(a) Corpo enviado ao OpenRouter, via log do backend:**
- `POST /chat` com `{"messages":[{"role":"user","parts":[{"type":"text","text":"oi"}]}]}` →
  `500` (esperado, sem chave real). Log do backend mostra `requestBodyValues: { model:
  'z-ai/glm-5.3-flash', ..., reasoning: { effort: 'max' } }` — bate com a preferência salva na
  hora (GLM+max, resultado do passo 3).
- `POST /tasks/<TASK_ID>/messages/create` com `{"content":"ajusta o texto dessa task"}` → `500`
  (esperado). Log mostra **o mesmo** `model: 'z-ai/glm-5.3-flash'` e `reasoning: { effort: 'max' }`
  — prova que a rota de task também lê a preferência do usuário, não um default.

**(b) Sonda de `resolveOpenRouterModel`/`buildAgentCallTrace`** (script temporário em
`.../scratchpad/probe-model-effort.ts`, fora dos dois projetos):
- Parte 1: rodei `resolveOpenRouterModel` para os 3 modelos em **todos** os efforts de cada um (12
  combinações: 6 do Luna, 3 do DeepSeek, 3 do GLM). Todas retornaram `model.modelId` correto e
  `model.settings.extraBody.reasoning.effort` igual ao effort pedido — incluindo `max`, que não
  existe no `.d.ts` do `@openrouter/ai-sdk-provider` mas passa corretamente pelo `extraBody`
  (confirma que o descasamento de tipos do briefing foi resolvido).
- Parte 2: `buildAgentCallTrace({ steps: [], ..., selection: { modelSlug:
  'deepseek/deepseek-v4.1-flash', effort: 'max' } })` → trace devolvido com `modelSlug:
  'deepseek/deepseek-v4.1-flash', effort: 'max'`. Prova que o backend escreve os campos novos no
  trace.

**(c) Exibição do trace na UI:**
- Adaptei `seed-trace.ts` (cópia em `.../scratchpad/seed-trace-model-effort.ts`, **não** editei o
  original da run `2026-09-19-detalhes-mensagem`), acrescentando `modelSlug:
  'deepseek/deepseek-v4.1-flash'` e `effort: 'max'` ao objeto do trace. Rodei e criei a mensagem
  `6010b3f5-41d8-41c9-b991-a5f373c355ad`.
- Long-press na mensagem (simulado via `page.mouse.down()` + 700ms + `up()`, já que Playwright não
  tem gesto nativo de long-press) → abriu o menu de ações com "Ver input"/"Ver output".
  Screenshot 08.
- Abri "Ver input": o sheet de detalhe mostra as pills **`deepseek/deepseek-v4.1-flash`**,
  **`effort · max`**, `1.8s`, `ok` — exatamente como o DoD 4 exige. Screenshot 09.
- Expandi "Raw request JSON" do step semeado. Screenshot 10.

### 6. Estados de erro
**Passou nos dois cenários.**

**Erro de carga:**
- Com o sheet fechado, matei o backend (`pkill -f "tsx watch ./src/infra/http/server.ts"`) e abri
  `Settings`. Logo após abrir, a seção mostrou um skeleton transitório (screenshot 11) e, após as
  tentativas do React Query esgotarem, assentou na banda **`couldn't load your model settings`**
  com botão `retry` — não ficou presa no skeleton. Screenshot 12.
- Subi o backend de novo e toquei `retry`: a seção carregou com o par salvo (`GLM 5.3 Flash` +
  `max`, o último salvo no passo 3). Screenshot 13.

**Erro de save:**
- Com o sheet aberto e carregado (GLM+max), matei o backend de novo e cliquei em
  `GPT-5.6 Luna`. A UI reverteu para o par confirmado (`GLM 5.3 Flash` + `max`, chips
  `low high max`) e mostrou **`didn't save that — try again?`** com `retry`. Screenshot 14.
- Subi o backend e toquei `retry`: o par **tentado** (`GPT-5.6 Luna` + `max` — `max` porque era
  válido no par antigo e por isso preservado, não o default `medium`) foi salvo, não o antigo
  (GLM+max). Confirmado com `curl /agent-preferences/detail` →
  `{"modelSlug":"openai/gpt-5.6-luna","effort":"max",...}`. Screenshot 15. Prova o `lastAttempt`
  da Etapa 8 do plano.

### 7. Regressão mínima
**Passou.**

- Abri o trace de uma mensagem antiga (criada antes desta feature, `id f1e16a1f`, `Sep 19, 2026,
  8:08 PM`, sem `modelSlug`/`effort` no trace). A pill de modelo caiu em `trace.modelId`
  (`gpt-5.6-luna`) e a pill de effort não apareceu. Nada quebrou. Screenshot 16.

### 8. Sheet rolável
**Passou.**

- Com `GPT-5.6 Luna` selecionado (6 chips, seção mais alta), o botão `Sign out` seguiu
  visível/alcançável (bounding box dentro do viewport 390×844, sem precisar de scroll adicional
  neste teste — a seção coube inteira). Screenshot 17.

## Para cada Definição de Pronto do briefing

1. **Escolher um dos 3 modelos e o effort, lista mudando conforme o modelo** — provado
   (screenshots 01–04, 07, 17). A única ressalva é a regra de "manter effort válido ao trocar de
   modelo" descrita acima, que é consistente com a premissa do briefing, não uma falha.
2. **Persistência por usuário no backend** — provado: sobrevive a restart do backend
   (screenshot 05) e a fechar/reabrir o sheet sem reload (screenshots 06–07); rejeição de par
   inválido confirmada por `curl`.
3. **Mensagem nova no chat e dentro de uma task usam o modelo/effort escolhidos** — provado via
   log do backend (`requestBodyValues.model` e `.reasoning.effort` idênticos nas duas rotas,
   `POST /chat` e `POST /tasks/:id/messages/create`), já que o ambiente não tem chave real do
   OpenRouter.
4. **Trace de input/output mostra modelo e effort usados** — provado: sonda de
   `buildAgentCallTrace` (escreve os campos) + exibição na UI via mensagem semeada com trace
   (pills `deepseek/deepseek-v4.1-flash` e `effort · max`, screenshot 09).
5. e 6. Não são meus — lint/tsc e commit/push ficam com o implementador/orquestrador.

## Lista de screenshots

Pasta: `/tmp/claude-1000/-root-so-repos-ben-prototype/6938fb42-3615-45c5-a0ca-23839ef30716/scratchpad/screenshots/`

1. `01-settings-luna-default.png` — Estado inicial: GPT-5.6 Luna marcado, 6 chips de effort, `medium` marcado.
2. `02-settings-deepseek-high.png` — Após selecionar DeepSeek V4.1 Flash: 3 chips, `high` marcado (default do modelo).
3. `03-settings-glm-max-no-none.png` — Após selecionar GLM 5.3 Flash (vindo de DeepSeek+high): 3 chips sem `none`, `high` mantido (ver nota sobre discrepância do roteiro).
4. `04-settings-deepseek-max-clicked.png` — De volta a DeepSeek V4.1 Flash, chip `max` clicado.
5. `05-settings-persisted-after-backend-restart.png` — Após restart do backend + reload + reabrir Settings: DeepSeek+max persistiu.
6. `06-settings-reopen-no-reload-deepseek-max.png` — Fechar/reabrir sheet sem reload: DeepSeek+max manteve (cache invalidado corretamente).
7. `07-settings-reopen-no-reload-glm.png` — Trocar para GLM, fechar/reabrir sem reload: GLM+max manteve.
8. `08-longpress-trace-menu-pills.png` — Menu de ações após long-press na mensagem com trace novo (data + Ver input/Ver output).
9. `09-trace-sheet-model-effort-pills.png` — Sheet de detalhe do trace: pills `deepseek/deepseek-v4.1-flash`, `effort · max`, `1.8s`, `ok`.
10. `10-trace-sheet-raw-request-json.png` — Seção "Raw request JSON" expandida na aba Input.
11. `11-settings-load-error-couldnt-load.png` — Settings aberto logo após matar o backend: skeleton transitório.
12. `12-settings-load-error-band-with-retry.png` — Banda de erro assentada: "couldn't load your model settings" + retry.
13. `13-settings-retry-loaded-saved-pair.png` — Após subir o backend e tocar retry: carregou o par salvo (GLM+max).
14. `14-settings-save-error-reverted.png` — Backend derrubado com sheet aberto, tentativa de trocar para Luna: UI reverteu para GLM+max e mostrou "didn't save that — try again?".
15. `15-settings-retry-saved-attempted-pair-luna-max.png` — Backend subido, retry: salvou o par tentado (Luna+max), confirmado por curl.
16. `16-regression-old-trace-no-modelslug-effort.png` — Trace antigo sem modelSlug/effort: pill cai em `trace.modelId`, sem pill de effort.
17. `17-settings-scrollable-signout-reachable-luna6chips.png` — Luna selecionado (6 chips, seção mais alta), Sign out visível/alcançável.

## Falhas encontradas

Nenhuma falha real da Definição de Pronto. A única divergência é a nota do passo 1 (narração do
roteiro esperava `max` ao clicar GLM pela primeira vez; o app mostrou `high`, mantendo o effort
válido do modelo anterior em vez de resetar para o default do novo modelo) — comportamento
consistente com a premissa escrita no briefing, não uma falha de implementação. Reportando para
que o orquestrador decida se quer ajustar o texto do roteiro/premissa ou considerar isso aceito.

## Observação fora de escopo

O bottom-sheet de Settings mostra constantemente a banda "couldn't load full profile" acima da
seção "Ben's model", mesmo com o backend saudável e a seção de modelo carregando normalmente.
Não faz parte da Definição de Pronto desta feature (é sobre carregar o perfil do usuário, não
model/effort) e não bloqueou nenhuma prova deste teste — reportando apenas para conhecimento.

## Premissas assumidas durante o teste

- Não havia `OPENROUTER_API_KEY` real no ambiente (confirmado pelos erros 401/500 nas chamadas de
  chat/task), então usei as provas substitutas (a/b/c) do próprio roteiro como caminho principal,
  como o plano já previa.
- Simulei "long press" via Playwright com `mouse.down()` + espera de 700ms + `mouse.up()` sobre o
  centro do elemento, já que não há gesto nativo de long-press na ferramenta usada.
- Identifiquei a mensagem certa para long-press comparando `createdAt` retornado por
  `GET /messages/list` (mais recente primeiro) com a ordem no DOM (que reflete a mesma ordem,
  mais recente primeiro, renderizada de baixo para cima na tela).
