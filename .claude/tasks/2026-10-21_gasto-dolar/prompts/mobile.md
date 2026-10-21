# Escopo mobile — gasto-dolar

Git: branch `feat/improve-ben`, base `86cf204` + commit do escopo backend desta task (`simple-loop(gasto-dolar): implement — backend…`). O código pode já conter as mudanças de modelos-gpt6 e preferencias-servidor (stores/hooks de preferências, idioma no servidor, switch nas configurações): integre, não reverta. App: `packages/infra/mobile/ben` (prefixo `src/` abaixo).

## Contrato do backend (já implementado no escopo anterior)
- POST transcription -> `{ text, costUsd: number | null }`.
- POST chat aceita `transcriptionCostUsd?: number | null` no body; responde com `interactionCostUsd: number | null`.
- GET mensagens: cada `Message` traz `costUsd` e `interactionCostUsd` (`number | null`).
- POST task message traz `costUsd` (só tipar; não exibir).
- Trace: `usage.costUsd` em cada step e em `totalUsage`.

## O que construir
1. **Tipos da API**: `api/models/message.ts:13-19` (`costUsd?`, `interactionCostUsd?: number | null`); `api/models/message-trace.ts:24-30` (`costUsd: number | null` no usage); `api/responses/transcription.ts` (`costUsd`); `api/responses/agent-reply*` (`interactionCostUsd`); `api/responses/task.ts:14` (`costUsd`).
2. **Requests**: `api/requests/transcription.ts` devolve `{ text, costUsd }`; `api/requests/chat.ts` `requestSendChatMessage(text, transcriptionCostUsd?)` envia o campo no body só quando houver valor.
3. **Voz**: `layout/stores/voice-store/{types.ts:21,index.ts:23,40,62-66}`: handler passa a ser `(text, costUsd: number | null) => void`. `pages/chat/page.tsx:53` chama `sendText(text, { transcriptionCostUsd: costUsd })`. `pages/task-workspace/page.tsx:47` ignora o custo (não exibido; fora do escopo).
4. **Messages store** `pages/chat/stores/messages-store/`: `types.ts:11` `sendText(content, options?: { transcriptionCostUsd?: number | null })`; `index.ts:22` grava o custo na metadata da msg do usuário (`buildUserMessage` em `message-builders.ts`) e repassa a `dispatchReply`; `retrySend` relê esse custo da última msg user; `dispatch-reply.ts:17` passa `reply.interactionCostUsd` para `buildBenMessage`.
5. **Metadata** `pages/chat/utils/chat-messages.ts:4-9`: `BenMessageMetadata` ganha `costUsd?: number | null` (user) e `interactionCostUsd?: number | null` (ben). `pages/chat/hooks/use-chat-messages.ts:12` mapeia os campos da API.
6. **Formatação** novo `pages/chat/utils/format-usd-cost.ts`: `Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 })`; valor > 0 e < 0.0001 -> `'< '` + formato de 0.0001. Locale = idioma atual do app (fonte vigente do idioma: `layout/stores/language-store.ts` ou a que preferencias-servidor deixou).
7. **Rodapé** novo `pages/chat/components/message-footers/cost-footer.tsx` (espelhe `send-retry-footer.tsx`/`transcribing-footer.tsx` na estrutura e tokens): texto pequeno e discreto com o valor formatado, `accessibilityLabel` localizado en/pt-BR em `pages/chat/strings/chat-strings.ts` (ex. "Cost of this interaction: {valor}" / "Custo desta interação: {valor}"). Visual conforme `design-rules.md` (token de texto secundário, sem cor nova).
8. **Ligação** `pages/chat/components/chat-history/chat-history.tsx:39-52`: para msg ben com `interactionCostUsd` numérico e flag ligada, `footer={<CostFooter … />}`; msg user em erro mantém `SendRetryFooter`. A flag vem da preferência do usuário criada por preferencias-servidor (nome provisório `showUsdCost`, boolean, padrão desligado): confirme nome e fonte com `grep -rn "Usd\|usd\|Cost" src` e só leia (seletor/hook existente). Prefira o componente ler a flag sozinho e retornar `null` quando desligada ou sem valor, para manter `renderItem` simples (minimum-props).

## Decisões vinculantes
Sem valor (null/undefined, msgs antigas) ou flag desligada: nenhum rodapé. Não criar switch, storage ou store de preferência (é de preferencias-servidor). Sem chip no sheet do trace. Task workspace não exibe custo.

## Convenções (só caminhos)
`.claude/skills/code-get-coding-designs/designs/{mobile-app-structure,page-structure,page-stores-structure,feature-state-components-structure,api-client-structure}.md`; `.claude/skills/code-write-code/general-coding-practices.md`; `.claude/skills/code-write-code/coding-patterns/frontend/{react-components,minimum-props-strategies,frontend-code-preferences}.md`; `coding-patterns/{general-code-preferences,lint}.md`; `.claude/skills/code-get-project-context/mobile/design/design-rules.md`.

## Não quebrar
Animação de resposta (`animateReply`), retry de envio, `MessageTracePressable` envolvendo a bolha ben, CaptureCard, transcrição no task workspace.

## Aceite
- Flag ligada: resposta nova e histórico mostram o custo sob a bolha do Ben (texto e voz; voz soma a transcrição); flag desligada: nada.
- en `$0.0123`, pt-BR `US$ 0,0123`; msgs antigas sem rodapé.
- `pnpm typecheck` sem erro no pacote mobile.

## Arquivos que você possui
Os listados acima em `packages/infra/mobile/ben/src` (api models/responses/requests, voice-store, chat page, task-workspace page só a assinatura do handler, messages-store, chat-messages, use-chat-messages, format-usd-cost, cost-footer, chat-strings, chat-history). Nada do backend.

## Fechamento
Na raiz, nesta ordem, saídas em arquivo em `.claude/tasks/2026-10-21_gasto-dolar/`: `pnpm lint:fix > lint-mobile.log 2>&1`, `pnpm typecheck > typecheck-mobile.log 2>&1`. Verde, commit só dos arquivos tocados mais a pasta da task: `simple-loop(gasto-dolar): implement — rodapé de custo no chat mobile`. Sem push.
