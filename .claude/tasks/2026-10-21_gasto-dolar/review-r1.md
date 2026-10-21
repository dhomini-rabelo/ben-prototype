APPROVED_WITH_RESALVAS

# Review r1 — gasto-dolar (backend 2f571f4, mobile e95e4c9)

Escopo revisado: diff dos dois commits (ports, ben-agent-provider/{models,trace-builders,index}, provider AssemblyAI, use cases chat/task/transcription + testes, dublês, presenters, rotas chat/transcription/task message; mobile api, voice-store, chat page, messages-store, chat-messages, use-chat-messages, format-usd-cost, cost-footer, chat-strings, chat-history). Logs de lint/typecheck/test (backend) e lint/typecheck (mobile) verdes, não re-executados.

## Completude vs critérios de aceite
- POST chat grava `costUsd` (= `trace.totalUsage.costUsd`, soma dos steps das fases context + format, `index.ts:145`) e `interactionCostUsd` na msg ben; `transcriptionCostUsd` no body vai para o `costUsd` da msg user e entra na soma via `triggerCostUsd` (`routes/chat.ts`). OK.
- GET mensagens e resposta do POST chat expõem os campos; `MessagePresenter` usa `?? null` para msgs antigas; `AgentReplyPresenter` devolve `interactionCostUsd`. OK.
- POST transcription devolve `{ text, costUsd }`; POST task message devolve `costUsd`. OK.
- Rodapé: `CostFooter` lê `useUserPreferencesStore.showUsdCost` (padrão `false`) e retorna `null` sem flag ou sem valor numérico; só em msg ben; msg em erro mantém `SendRetryFooter`. `MessageBubble` renderiza `{footer}` sem wrapper, então `null`/`false` não deixa espaço. Formato `Intl.NumberFormat` com `LANGUAGE_LOCALES`, piso `< 0,0001`. OK.
- Testes: persist-ben (soma, só trace, só trigger, ambos ausentes -> null), persist-user (valor e null por padrão), create-task-message (custo e null), transcribe-audio. OK.
- Fluxos preservados: `animateReply` mantém `metadata` (`animate-reply.ts:20` faz spread), retry relê `costUsd` da última msg user, `MessageTracePresenter` omite os campos novos (rota de trace inalterada), task-workspace segue compatível (handler com 1 parâmetro é atribuível).

## Premissas "a revisar no validate"
1. **Turns de tarefa com custo capturado mas não persistido** — aceita. O briefing define "resposta do Ben" como chamada que gera mensagem do Ben *persistida*; turn de tarefa não persiste mensagem (fica em memória no app), então capturar e devolver `costUsd` sem exibir está coerente. Persistência fica em "fora do escopo".
2. **Custo da transcrição ecoado pelo app sem verificação** — aceita para protótipo (só exibição, dado do próprio usuário; schema barra NaN/infinito/negativo). Risco registrado: o cliente pode inflar/zerar o próprio rodapé. A versão confiável (id do registro de transcrição) segue como melhoria fora do escopo.
3. **Preços AssemblyAI** — conferidos agora em https://www.assemblyai.com/pricing.md: `universal-3-5-pro` US$ 0,21/h e `universal-2` US$ 0,15/h, iguais ao mapa em `assemblyai-transcription-provider.ts:9-12`. A página não documenta o modelo padrão (avisa que difere entre conta free e paga) e lista ids legados `best` (-> universal-3-5-pro) e `nano` (-> universal-2) sem preço próprio.
4. **Custo null quando o modelo não é identificável** — implementado (`calculateCostUsd`, l.16-24: sem duração, sem modelo ou modelo fora do mapa -> `null`). O campo lido é `speech_model_used` ("The actual speech model that was used", `assemblyai/dist/types/openapi.generated.d.ts:2292`), que é o certo. Ver ressalva 1.

## Ressalvas (não bloqueiam)
1. `packages/infra/adapters/src/services/assemblyai-transcription-provider.ts:42` — o valor real de `speech_model_used` não foi observado numa resposta da API. Se vier um id legado (`best`, `nano`) ou outro nome, o custo da transcrição será sempre `null` e a voz não somará no rodapé, sem erro visível. O teste de sistema deve conferir o JSON do POST transcription; se vier `null`, a correção é fixar `speech_models` no request (já listado como melhoria fora do escopo), não mapear `best` sem preço publicado.
2. `packages/infra/adapters/src/services/ben-agent-provider/trace-builders.ts:94` — `const { usage } = step` contraria `general-coding-practices.md` ("object.property instead of destructuring in const declarations"); usar `step.usage.*`. O mesmo em `packages/domain/task/src/application/use-cases/tasks/create-task-message.ts:38` (`const { reply, costUsd }`) e `packages/domain/transcription/src/application/use-cases/transcription/transcribe-audio.ts:26` (este estende uma desestruturação que já existia).
3. `packages/infra/adapters/src/services/ben-agent-provider/trace-builders.ts:75-77` — `as { cost?: unknown } | undefined` sobre `JSONValue`; funciona e a guarda `typeof === 'number'` protege, mas o pacote `@openrouter/ai-sdk-provider` exporta o tipo do usage (`OpenRouterUsageAccounting`) que poderia nomear a forma. Cosmético.
4. `packages/infra/mobile/ben/src/pages/chat/components/chat-history/chat-history.tsx:50-56` — ternário aninhado com `isBen && <CostFooter/>` passa `false` como `footer` para msgs user; correto em runtime, mas `CostFooter` poderia receber `undefined` explicitamente (`isBen ? <CostFooter …/> : undefined`) para ler como os outros ramos. Cosmético.
5. Retry após falha do agente (`messages-store/index.ts:50-56`): o servidor já gravou a msg user na primeira tentativa (`routes/chat.ts`, persist antes do agente) e grava outra no retry com o mesmo `costUsd`. Cada msg ben soma uma vez só, então o rodapé fica certo; somatórios futuros por usuário contariam a transcrição em dobro. Comportamento de duplicação já existia; só registrar.

## Fora do que foi revisado
- O working tree tem mudanças não commitadas de historico-agente em `routes/chat.ts` e no agent provider; conferi que as linhas de custo (`transcriptionCostUsd`, `triggerCostUsd`, `interactionCostUsd`) continuam presentes no arquivo atual, mas o resto daquele diff não pertence a esta task.
- Rodapé visual (token `text-on-surface-variant`, `label-caps`, igual a `TranscribingFooter`) fica para o teste de sistema no browser.
