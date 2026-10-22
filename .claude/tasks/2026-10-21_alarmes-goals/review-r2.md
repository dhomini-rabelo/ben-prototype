APPROVED_WITH_RESALVAS

# Review r2 — alarmes-goals

Diff revisado: `git diff f1a6031..HEAD -- packages` (25 arquivos, fixes r9/r10), contra os 15 achados do review-r1. Veredito: **APPROVED_WITH_RESALVAS**. Nenhuma alta/média ficou aberta e não achei regressão real.

Evidência executada: `pnpm typecheck` passou em todos os pacotes; `pnpm test` passou (chat 99 testes, 18 arquivos).

## Status dos achados do r1

1. **Resolvido** (alta). `to-agent-reply.ts:39,50,68` (`isValidDate`) zera `remindAt` inválido e descarta goal sem `startsAt` válido; `persist-captures.ts:81,102,116` repete a guarda no domínio. Testes novos em `persist-captures.test.ts`.
2. **Resolvido**. `user-preferences-store.ts` ganhou `hasSyncedFromServer` (setado em `use-user-preferences-sync.ts`, zerado no `reset()` do logout); `use-daily-summary.ts:48-60` bloqueia o check e a notificação até o sync, e relê `getState()` depois do `await` antes de `show()`.
3. **Resolvido**. `alarm-popup-overlay.tsx:21` (`resolveAcknowledgedAt` = max(nextFireAt, agora)) em ack, finishGoal e check-in; a chave de dedupe segue em `nextFireAt`. Obs.: vários avisos vencidos ainda abrem popups em fila, mas o adiar já vale.
4. **Resolvido**. `update-reminder.ts:71,83` (`resolveAnchor`) usa max(âncora, now) só quando a agenda muda e `now` vem; rota aceita `now` ISO (`routes/reminders/update-reminder.ts`); `reminder-editor.tsx` envia `now` (evento e goal). Teste novo.
5. **Resolvido**. `daily-summary-popup.tsx:34` usa `firesAt ?? nextFireAt`.
6. **Resolvido**. `reminder-editor.tsx`: `buildBody` envia só `remindAt`/`recurrence` alterados e `choiceToRecurrence` preserva `weekdays`. Resalva: mudar só o horário do goal ainda move `remindAt` para hoje/amanhã (comportamento aceitável, já que o usuário mudou a hora).
7. **Parcial, baixa (confirmado)**. `reminder-editor.tsx:81-82` ainda mapeia `every-n-days` com N fora de 2/3 para 2 ou 3 na exibição; o editor já não reenvia sem mudança, então o dano só ocorre se o usuário mexer na frequência. Baixa: o agente raramente produz N diferente e não há perda silenciosa.
8. **Resolvido**. `subscribeToNotificationTaps(onTap)` em `notifications-service.ts`; fetch e enqueue em `use-alarm-scheduler.ts`.
9. **Resolvido**. Os dois comentários foram removidos.
10. **Resolvido**. `use-user-preferences.ts:15,77-108`: debounce de 600 ms por chave, `previous` do primeiro toque, rollback só sem escrita mais nova, sem `invalidate` por sucesso. Resalva baixa: um refetch externo durante a janela de 600 ms (ex.: foco) pode regravar o valor do servidor no store antes do envio.
11. **Resolvido**. `alarm-popup-goal.tsx:37` usa `reminder.firesAt ?? firedAt`; `goalAt` sem "hoje".
12. **Não corrigido, baixa (confirmado)**. `{ reminder }` vs `{ item }` é só consistência de contrato; o mobile funciona e o plan pedia `{ reminder }`.
13. **Resolvido**. Chaves renomeadas em `menu-strings.ts` e `menu-reminders-list.tsx`.
14. **Resolvido**. `morningTimeHint` en/pt-BR ajustado.
15. **Resolvido**. `agent-reply-presenter.ts` expõe `updatedGoalIds`; `invalidate-captured-queries.ts` invalida a lista de lembretes quando ele vem preenchido; o invalidate redundante saiu. Tipo no mobile é opcional (`AgentReply.updatedGoalIds?`), sem consequência.

## Regressões

Nenhuma real. Pontos conferidos: `acknowledgedUntil` em `update-reminder.ts` entra só no cálculo (`merged`), não é gravado; salvar vazio no editor não chama a API; o `hasSyncedFromServer` falso depois do logout é o comportamento desejado (relê no próximo login). Se o sync nunca completar (offline no start), o resumo não aparece: aceitável.

## Observações do system test (candidatas)

- **Baixa/média** — `notes` do alarme vaza texto do modelo para o body: `to-agent-reply.ts:53` repassa `reminder.notes` e `notifications-service.ts:64` usa `reminder.body`. Não corrigido; sugerido ajustar o prompt/schema ou não usar `notes` como body da notificação.
- **Baixa** — título truncado em `menu-list/menu-list-row.tsx` (`numberOfLines={1}` com `flex-1` no título, badge e trailing na mesma linha). Cosmético.
- **Baixa** — ISO cru no card do chat: não localizei o ponto exato nesta revisão (busca por `remindAt` em `pages/chat` não retornou). Falta evidência da origem; fica como observação do system test.

## Premissas assumidas

- Achados 7 e 12 foram deliberadamente deixados e são de fato baixos.
- Observações do system test viram resalvas, sem reabrir o escopo.
