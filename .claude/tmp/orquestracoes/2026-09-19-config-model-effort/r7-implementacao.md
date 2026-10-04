# r7 — Implementação: configurar modelo e effort do agente Ben

Implementação completa das Etapas 1–11 do `r3-plano-v2.md`, nos dois projetos, na ordem do plano.
Nenhuma etapa ficou pendente.

## Por etapa

- **Etapa 1** — `domain/entities/user.ts` ganhou `AgentModelSlug`, `AgentEffort` e os dois campos
  `agentModelSlug`/`agentEffort` em `UserProps`; `login-or-register.ts` e `smoke-sqlite.ts` passaram
  a criar usuário com os dois campos `null`; `user-presenter.ts` excluiu os dois campos do `Omit`.
  Sem divergência.
- **Etapa 2** — criado `domain/utils/agent-models.ts` com `AGENT_MODELS`, `findAgentModel`,
  `resolveAgentSelection` etc., exatamente como o Contrato C2. Sem divergência.
- **Etapa 3** — `adapters/agent-provider.ts` ganhou `model: AgentModelSelection` em
  `GenerateReplyPayload` e `GenerateTaskTurnPayload`; `adapters/agent-call-trace.ts` ganhou
  `modelSlug`/`effort` em `AgentCallTrace`. Sem divergência.
- **Etapa 4** — `models.ts` perdeu `openRouterModel` e ganhou `resolveOpenRouterModel` (Contrato C3);
  `trace-builders.ts` (`buildAgentCallTrace`) e `index.ts` (`BenAgentProviderService`, sem construtor)
  resolvem o modelo por chamada em `generateReply` e `generateTaskTurn`. Sem divergência.
- **Etapa 5** — criados `get-agent-preferences.ts` e `update-agent-preferences.ts` (com o guard
  privado `requireSupportedSelection`, Contrato C4, sem `as` e sem type predicate). Sem divergência.
- **Etapa 6** — criados `agent-preferences-presenter.ts` e as duas rotas
  (`agent-preferences/get-agent-preferences.ts`, `.../update-agent-preferences.ts`); registradas em
  `app.ts` depois de `/captures/counts`; `chat.ts` e `tasks/create-task-message.ts` (rota e use-case
  de domínio) passaram a resolver a preferência do usuário e repassá-la como `model`. Sem divergência.
- **Etapa 7** — criados `api/models/agent-preferences.ts` (Contrato C6), bloco `agentPreferences` em
  `api/routes.ts`, `api/requests/agent-preferences.ts` (`requestUpdateAgentPreferences`) e
  `layout/hooks/api/use-agent-preferences-data.ts`. Sem divergência.
- **Etapa 8** — criado `layout/hooks/use-agent-preferences.ts` (Contrato C7) com `confirmed`/`draft`/
  `lastAttempt`, `save()` com `.then/.catch`, `invalidate()` no sucesso, `retry()` cobrindo os dois
  caminhos (save falho → reenvia `lastAttempt`; erro de carga → `refetch()`). Sem divergência.
- **Etapa 9** — criados os cinco componentes puros em `layout/components/menu-settings/`:
  `agent-settings-loading.tsx`, `agent-settings-error.tsx`, `agent-model-option.tsx`,
  `agent-effort-chips.tsx`, `agent-settings-controls.tsx` (Contrato C9). Nenhum importa hook de dados.
  Sem divergência.
- **Etapa 10** — `settings-sheet.tsx` ganhou a prop `agentSection?: ReactNode`, o `ScrollView` com
  `maxHeight: height * 0.7` de `useWindowDimensions()` envolvendo perfil + bloco do agente + sign-out,
  e o título `Ben's model`; `settings-view.tsx` chama `useAgentPreferences()` e monta o ramo fixo
  `loading → error → data`. Sem divergência.
- **Etapa 11** — `api/models/message-trace.ts` (mobile) ganhou `modelSlug`/`effort`;
  `message-trace-meta-strip.tsx` mostra `trace.modelSlug ?? trace.modelId ?? 'unknown model'` e uma
  pill `effort · {trace.effort}` só quando existe. Sem divergência.

## Divergências do plano

Nenhuma divergência material. Um único ajuste de implementação, não de comportamento: em
`use-agent-preferences.ts`, o Contrato C7/Etapa 8 não detalha o que `selectModel` deve fazer se
`selection` for `null` no momento da chamada. Implementei como no-op (`if (!selection) return`),
simétrico ao guard que a Etapa 8 já pede explicitamente em `selectEffort`. Na prática isso nunca
dispara: `AgentSettingsControls` só é renderizado no ramo `'ready'`, onde `selection` já não é `null`
(Etapa 10). Registrado como premissa documentada, não como pergunta pendente.

## Verificação end-to-end (backend, sem depender do teste completo do roteiro)

Com o backend já rodando (`tsx watch`, porta 3333) e um usuário semeado via
`seed-ambiente.ts` (`.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-ambiente.ts`):

- `GET /agent-preferences/detail` sem preferência salva → default
  `{"modelSlug":"openai/gpt-5.6-luna","effort":"medium","models":[...3 itens...]}`. Confirma R1
  (linha antiga sem as chaves novas cai no default) e D2/D3.
- `POST /agent-preferences/update` com `{"modelSlug":"z-ai/glm-5.3-flash","effort":"medium"}` → 400
  `{"effort":["UNSUPPORTED_AGENT_EFFORT#undefined"]}`. Confirma D9/C5.
- `POST /agent-preferences/update` com `{"modelSlug":"deepseek/deepseek-v4.1-flash","effort":"max"}`
  → 200 com o par salvo; `GET` subsequente devolve o mesmo par (persistência real via sqlite). Confirma
  D1/D2, itens 1 e 2 da Definição de Pronto.
- `POST /chat` com a preferência acima salva → falha 401 do OpenRouter (chave falsa, R4 confirmado:
  `.env`/`.env.development` com `OPENROUTER_API_KEY=fake-openrouter-key-...`), mas o log do backend
  mostra `requestBodyValues.model: 'deepseek/deepseek-v4.1-flash'` e
  `requestBodyValues.reasoning: { effort: 'max' }` — prova que a seleção do usuário chega ao corpo
  real enviado ao provider (D6, prova substituta do item 3 da Definição de Pronto prevista em R4).
- Preferência do usuário de teste resetada para o default (`openai/gpt-5.6-luna` / `medium`) ao final,
  para não deixar o ambiente sujo para a próxima rodada.

Não rodei o roteiro completo do browser-tester (screenshots, DoD 1/2 pela UI, estados de erro
simulados derrubando o backend, etc.) — isso pertence à etapa seguinte do loop (sonnet browser
tester), não à implementação. As verificações acima são apenas uma prova mínima de que os contratos
HTTP e a resolução de modelo/effort funcionam de ponta a ponta antes de passar a bola.

## Lint e tsc

```
cd project-backend && npm run lint:fix   → EXIT=0
cd project-backend && npx tsc --noEmit   → EXIT=0
cd project-mobile  && npm run lint:fix   → EXIT=0
cd project-mobile  && npx tsc --noEmit   → EXIT=0
```

Nenhum erro novo nos dois projetos; baseline preservado.

## `seed-task.ts`

**Não criado.** Ele pertence ao passo 4 do "Plano de teste" do `r3-plano-v2.md`, que é roteiro do
browser-tester (rodada seguinte do loop), não uma das Etapas 1–11 de implementação que esta rodada
cobre. Fica para quem executar o roteiro de teste, seguindo a especificação exata já escrita no
plano (seção "Plano de teste", passo 4).
