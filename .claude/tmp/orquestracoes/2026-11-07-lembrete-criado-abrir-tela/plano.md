# Plano — card de lembrete no chat abre o detalhe; único/recorrente claro

## Resumo do plano

### O que muda

#### Checkpoint 1 — O card recebe o tipo e a repetição atual do lembrete
- **`CaptureView` do domínio.** Ganha dois campos crus, `reminderKind` (alarme, goal, quando acontecer) e `recurrence` (nenhuma, todo dia, dias da semana). Task e nota levam os dois vazios.
- **Uma função só monta a view do lembrete.** A resposta que cria o lembrete e o histórico da conversa passam a usar a mesma função, que lê o lembrete como ele está agora. Assim o card antigo mostra a repetição atual, como já acontece com o título.
- **Testes do domínio.** Sete casos novos (T01 a T07). As comparações de formato exato que já existem em `persist-captures.test.ts` e `resolve-capture.test.ts` ganham os dois campos novos.
- **Server.** Nenhuma mudança de código: os presenters repassam a view inteira. Só o typecheck confere.

#### Checkpoint 2 — O rótulo de repetição em en e pt-BR, na lista e no detalhe
- **Contrato do app.** O `MessageCapture` aceita os dois campos novos como opcionais. Sem eles, o card mostra só o horário, como hoje.
- **Rótulo montado no app.** Strings novas em en e pt-BR ("Único"/"One-time", "Todo dia"/"Every day", "Dias úteis"/"Weekdays", e Seg..Dom/Mon..Sun) e uma função pura que escolhe o rótulo. Segunda a sexta vira "Dias úteis", os sete dias viram "Todo dia", outros conjuntos viram os dias na ordem segunda a domingo. Seis casos de teste (T08 a T13).
- **Linha da lista.** O texto de apoio ganha o rótulo na frente ("Todo dia · capturado há 10min"), nas linhas ativas e nas concluídas. O lembrete "quando acontecer" fica só com o selo de tipo.
- **Detalhe.** O box ganha uma linha com o ícone de repetição e o rótulo, logo abaixo do horário absoluto (V2). No "quando acontecer" a linha não aparece.

#### Checkpoint 3 — O card tocável abre o detalhe e o voltar leva à conversa
- **Pílula do card.** Fica "amanhã 08:00 · Todo dia", com o horário exatamente como hoje. O "quando acontecer" ganha a pílula "Quando acontecer" no lugar do horário que ele não tem.
- **Card inteiro tocável, só o de lembrete.** O card fica mais claro enquanto o dedo está nele, sem seta nem botão novo. O card de task continua com o botão e o de nota continua sem toque. A regra "este card abre o detalhe?" vira uma função pura com teste (T15): o card em erro não abre.
- **Abertura sem rota nova.** O toque grava no estado do menu "lista de lembretes + detalhe deste lembrete + veio do chat" e abre a tela do menu que já existe. Um segundo toque rápido é ignorado.
- **Voltar.** O voltar da lista aberta pelo card faz voltar à conversa. Ela continua montada por baixo, então volta no mesmo ponto. Ao sair da tela, a marca "veio do chat" é esquecida, e o caminho pelo menu continua como hoje (teste T14).
- **Limpeza.** As pastas do protótipo desta task são removidas. As de outras runs ficam.

### Decisões que travei sozinho
- **Rótulo montado no app, não no server.** O server manda só o tipo e a repetição crus. Custo: o app depende de os dois campos chegarem, e sem eles o card mostra só o horário.
- **Alarme é sempre "Único"**, mesmo que algum dia tenha repetição gravada: o tipo vence a repetição (AC-002). O goal com repetição "nenhuma", sem valor ou com a lista de dias vazia também vira "Único".
- **Ordem dos dias: segunda a domingo**, com o domingo no fim ("Seg, Qui"; "Sáb, Dom"). As abreviações são uma tabela própria, sem ponto, e não saem do `Intl`.
- **Toque duplo:** o segundo toque é ignorado enquanto a tela de lembretes aberta pelo chat está de pé. O voltar continua sendo um só (CB-005).
- **Nomes:** `getRecurrenceLabel` (lista e detalhe) e `getCaptureReminderLabel` (card) em `layout/utils/recurrence-label.ts`; `isCaptureOpenable` em `pages/chat/utils/capture-openable.ts`; `origin: 'menu' | 'chat'` e `openReminderFromChat` no `menu-store`; o card do chat sai para `chat-capture-card.tsx`.
- **T15 com dois casos a mais**, além dos dois do roteiro: card de task e card de nota também não abrem o detalhe. Nenhuma prova do roteiro foi acrescentada nem reescrita.
- **Provas com sessão e dados reais além das que você pediu:** S01 a S07 e S33 a S40 também rodam com o server local e os dados da Ana no banco. São fluxos de navegação sem estado de erro, e o banco dá o mesmo resultado a cada rodada.

### O que fica de fora
- A galeria `packages/infra/mobile/design` não é tocada.
- Nenhuma rota, link nem tela nova. Recarregar a página em `/menu` perde a marca "veio do chat", porque não há link direto (RT-003).
- O card de uma conversa aberta não se atualiza sozinho depois de editar a repetição. Ele mostra a repetição nova quando a conversa recarrega (CB-010).
- A troca de `BACKEND_URL` e os dados de prova (`dev.db`, JWT) não entram em commit.
- A memória que diz "recorrente não é v1" continua desatualizada. Atualizá-la é com você.

### Como se prova
- AC-001: o card mostra o rótulo junto do horário, em pt-BR e en (S08, S09, S45; T01 a T07 na lane teste).
- AC-002: alarme e goal sem repetição mostram "Único"/"One-time" (S08, S09, S12, S13; T01, T02, T08).
- AC-003: todo dia, dias úteis, sete dias e dias soltos mostram o rótulo certo (S08, S09, S14 a S16, S19, S20, S45; T03 a T05, T09 a T12).
- AC-004: o "quando acontecer" mostra "Quando acontecer"/"When it happens" no card (S08, S09, S17; T06, T13).
- AC-005: um card antigo do histórico também mostra o rótulo, com a repetição atual (S01, S08, S44; T07).
- AC-006: tocar em qualquer parte do card abre a lista com o detalhe certo por cima (S02, S05, S46; RT-003 na lane codigo).
- AC-007: o card fica mais claro enquanto é pressionado (S01).
- AC-008: fechar o detalhe deixa a lista de lembretes na tela, com o lembrete nela (S03, S32, S47).
- AC-009: o voltar da lista leva à conversa, no mesmo ponto, sem passar pelo menu (S04, S07, S27, S31, S48).
- AC-010: cada linha da lista, ativa ou concluída, mostra o rótulo; a "quando acontecer" mostra só o selo (S10, S11, S43).
- AC-011: o box do detalhe mostra a linha do rótulo; no "quando acontecer", só o selo (S12 a S20, S46).
- AC-012: mudar para "Diária" e salvar troca o rótulo no detalhe e na lista (S21 a S23).
- AC-013: o botão do card de task abre a task (S33).
- AC-014: o card de nota não abre nada (S34).
- AC-015: segurar a bolha do Ben abre o menu de ações (S35).
- AC-016: o menu pelo botão do topo abre a lista do menu, e o voltar de Lembretes leva a ela, inclusive depois de ter vindo pelo card (S36, S39, S40; T14).
- AC-017: na lista, tocar num lembrete abre o detalhe e fechar volta à lista (S37, S38).
- AC-018: o editor de repetição continua funcionando (S21, S22).
- AC-019: o horário do card e o selo de tipo continuam como hoje (S08, S10).
- AC-020: o aviso do alarme e as notificações continuam como hoje. Isso é conferido no diff (S41 na lane codigo, desvio aprovado no gate do roteiro).

## Objetivo
Tocar no card de lembrete que o Ben criou na conversa abre a lista de lembretes com o detalhe daquele lembrete por cima, e o voltar da lista leva de novo à conversa. O card, a linha da lista e o detalhe dizem se o lembrete toca uma vez ou se repete, em en e pt-BR.

## Passos

Caminhos relativos à raiz do repositório. Abreviações usadas abaixo: `D = packages/domain/chat/src`, `M = packages/infra/mobile/ben/src`. Commit ao fim de cada checkpoint, como manda o `CLAUDE.md`.

### Checkpoint 1 — O card recebe o tipo e a repetição atual do lembrete
1. (RT-001) **`D/application/types/capture-view.ts`** — acrescentar a `CaptureView` os campos `reminderKind: ReminderKind | null` e `recurrence: GoalRecurrence | null`, com `import type { GoalRecurrence, ReminderKind } from '@ben/adapters'` (o mesmo import que `D/enterprise/entities/reminder.ts` usa).
2. (RT-001, RT-002) **`D/application/utils/reminders.ts`** — exportar `toReminderCaptureView(reminder: Reminder): CaptureView`, que devolve `{ kind: 'reminder', itemId: reminder.id.toValue(), title: reminder.props.title, meta: reminder.props.remindAt ?? null, reminderKind: reminder.props.kind, recurrence }`. `recurrence` é `reminder.props.recurrence` só quando `reminder.props.kind === 'goal'` e a repetição existe com `type !== 'none'`; em qualquer outro caso é `null`. Assim o "nenhuma", o "sem valor" e o alarme chegam iguais (T01, T02). A função segue a convenção de util por entidade que esse arquivo já tem.
3. (RT-001) **`D/application/use-cases/captures/persist-captures.ts`** — o `toReminderView` privado (l.166) passa a devolver `toReminderCaptureView(reminder)`. As views de task (l.208) e de nota (l.233) ganham `reminderKind: null, recurrence: null`.
4. (RT-001, RT-002) **`D/application/use-cases/captures/resolve-capture.ts`** — o `resolveReminderView` (l.44-45) mantém o `findUnique` e o `return null` quando o lembrete sumiu, e troca a montagem à mão por `toReminderCaptureView(reminder)`. Como a view passa a ler `reminder.id.toValue()`, remover o parâmetro `itemId` de `resolveReminderView` e da chamada em `resolveCaptureView` (senão o `@typescript-eslint/no-unused-vars` acusa e o `lint:fix` não corrige). As views de task (l.65) e de nota (l.74) ganham `reminderKind: null, recurrence: null`.
5. (RT-001) **`D/application/use-cases/captures/__tests__/persist-captures.test.ts`** — primeiro, acrescentar `reminderKind` e `recurrence` a todo `toEqual` de formato exato que já existe (alarme, conditional, goal, task e nota). Depois, escrever os casos novos com `ReminderFactory`/drafts, como os testes vizinhos (alarme l.37, conditional l.151, goal l.174):
   - T01: draft de alarme → view com `reminderKind: 'alarm'` e `recurrence: null`.
   - T02: goal com `recurrence: { type: 'none' }` e goal sem `recurrence` (draft montado com `as unknown as GoalDraft`) → os dois com `reminderKind: 'goal'` e `recurrence: null`.
   - T03: `{ type: 'daily' }` → `recurrence: { type: 'daily' }`.
   - T04: `{ type: 'weekdays', weekdays: [1, 2, 3, 4, 5] }` → a mesma repetição na view.
   - T05: `{ type: 'weekdays', weekdays: [1, 3] }` → a mesma repetição na view.
   - T06: conditional → `reminderKind: 'conditional'`, `meta: null`, `recurrence: null`.
6. (RT-002) **`D/application/use-cases/captures/__tests__/resolve-capture.test.ts`** — acrescentar os dois campos a todo `toEqual` de formato exato que já existe, inclusive o da l.48. Escrever o T07: `reminderFactory.create({ kind: 'goal', recurrence: { type: 'none' } })`, depois `await reminderRepository.update(reminder.id, { recurrence: { type: 'daily' } })` (o `update(id, partialProps)` do `InMemoryRepository`, `packages/domain/base/src/repository/repository.ts:186`), depois `sut.execute({ capture: { kind: 'reminder', itemId: reminder.id } })` → `item.recurrence` igual a `{ type: 'daily' }` e `item.reminderKind` igual a `'goal'`.
7. (RT-001) **`packages/infra/server-ben`** — nenhum arquivo muda: `message-presenter.ts` e `agent-reply-presenter.ts` repassam `capture` inteiro. Rodar `pnpm --filter @ben/server-ben typecheck` para confirmar. Se algum presenter montar a view campo a campo, acrescentar os dois campos ali e registrar no relatório do checkpoint.

### Checkpoint 2 — O rótulo de repetição em en e pt-BR, na lista e no detalhe
8. (RT-001) **`M/api/models/message.ts`** — `MessageCapture` ganha `reminderKind?: ReminderKind | null` e `recurrence?: GoalRecurrence | null`, com `import type { GoalRecurrence, ReminderKind } from '@/api/models/reminder'`. São opcionais, como `meta?`, porque um server antigo não os manda. `M/api/responses/agent-reply.ts:24` reusa o tipo e não muda.
9. (infra, pré-requisito do passo 10) **`M/layout/strings/recurrence-strings.ts`** (novo) — `export const recurrenceStrings: Localized<{ oneTime: string; everyDay: string; weekdays: string; weekdayAbbreviations: string[] }>`, no mesmo formato de `M/layout/strings/format-time-strings.ts`. Valores: en `One-time`, `Every day`, `Weekdays`, `['Sun','Mon','Tue','Wed','Thu','Fri','Sat']`; pt-BR `Único`, `Todo dia`, `Dias úteis`, `['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']`. O índice segue a numeração do backend, 0 = domingo (`D/application/utils/reminders.ts:130`). O arquivo importa só tipos.
10. (RT-001) **`M/layout/utils/recurrence-label.ts`** (novo) — `type ReminderSchedule = { kind: ReminderKind; recurrence: GoalRecurrence | null }` e duas funções puras, que leem `recurrenceStrings[language]` como `format-time.ts` lê `formatTimeStrings[language]`:
    - `getRecurrenceLabel(schedule: ReminderSchedule, language: Language): string | null`:
      - `conditional` → `null`;
      - `alarm` → `oneTime`;
      - `goal` com `recurrence` nulo, `type === 'none'` ou `weekdays` vazio → `oneTime`;
      - `daily`, ou os sete dias distintos → `everyDay`;
      - exatamente {1,2,3,4,5} → `weekdays`;
      - qualquer outro conjunto → abreviações sem repetição, ordenadas de segunda a domingo (chave de ordenação `(day + 6) % 7`), unidas por `', '`.
    - `getCaptureReminderLabel(schedule: ReminderSchedule, language: Language): string` — `conditional` → `menuStrings[language].reminderKinds.conditional`; os outros tipos → `getRecurrenceLabel(schedule, language)`.
    - Tipos importados como `import type` de `@/api/models/reminder` e `@/core/languages`. Nada de `react-native` (o teste roda em node).
11. (RT-001) **`M/layout/utils/__tests__/recurrence-label.test.ts`** (novo) — um `describe` por função e casos em `en` e `pt-BR`:
    - T08: alarme, goal `none` e goal com `recurrence: null` → "One-time"/"Único".
    - T09: `daily` → "Every day"/"Todo dia".
    - T10: `[1,2,3,4,5]` → "Weekdays"/"Dias úteis".
    - T11: `[0,1,2,3,4,5,6]` → "Every day"/"Todo dia".
    - T12: `[3,1]` → "Mon, Wed"/"Seg, Qua".
    - T13: conditional → `getCaptureReminderLabel` dá "When it happens"/"Quando acontecer" e `getRecurrenceLabel` dá `null`.
12. (RT-001) **`M/layout/components/menu-reminders/menu-reminders-list.tsx`** — com `const language = useLanguage()`, calcular `const label = getRecurrenceLabel({ kind: reminder.kind, recurrence: reminder.recurrence }, language)` em cada linha. O `supporting` da linha ativa (l.48, `capturedSupporting`) e o da concluída (l.74, `doneSupporting`) passa a ser `label ? \`${label} · ${status}\` : status`, em que `status` é o texto que cada linha já monta hoje. O selo de tipo e o tempo à direita não mudam.
13. (RT-001) **`M/layout/components/menu-detail/reminder-detail.tsx` → `item-detail-content.tsx` → `item-detail-reminder-meta.tsx`** — `reminder-detail.tsx` calcula `getRecurrenceLabel({ kind, recurrence }, language)` do lembrete carregado e o passa como `recurrenceLabel?: string` (o `null` vira `undefined`) para `ItemDetailContent`, que o repassa para `ItemDetailReminderMeta`. Ali, quando há rótulo, renderizar entre a linha de `firesAtAbsolute` e a de `nextFireAbsolute` uma `View` `flex-row items-center gap-1.5 pt-0.5` com `<Repeat size={14} color={onSurfaceVariant} />` (`phosphor-react-native`, cor de `@/layout/utils/colors`) e `<Typography variant="body-md" className="font-sans-semibold text-on-surface">`. É o bloco da V2 em `M/prototipo/lembrete-criado-abrir-tela/variacao-2.tsx:83-89`. O editor (`reminder-editor.tsx`) não muda: o salvar já invalida detalhe, lista e contagens (l.230-237), e é isso que faz AC-012 acontecer.

### Checkpoint 3 — O card tocável abre o detalhe e o voltar leva à conversa
14. (RT-001) **`M/pages/chat/components/capture-card/capture-card-meta.tsx`** — `CaptureCardMetaProps` vira `{ children: string; label?: string }`. O texto passa a ser `label ? \`${time} · ${label}\` : time`, com `time = formatRemindAt(...)` como hoje. A guarda `state === 'error' || kind !== 'reminder'` fica.
15. (RT-001) **`M/pages/chat/components/capture-card/capture-card-kind-pill.tsx`** (novo) e **`index.tsx`** — `CaptureCardKindPill({ children }: { children: string })`, com a mesma guarda de `useCaptureCard()` do Meta e o estilo do `KindPill` de `M/prototipo/lembrete-criado-abrir-tela/parts.tsx:69`: `View` `mt-[3px] self-start rounded-full bg-surface-container-high px-2 py-0.5` e `Text` `font-mono text-[11px] text-on-surface-variant`. Registrar como `KindPill: CaptureCardKindPill` no objeto `CaptureCard`.
16. (RT-003) **`M/pages/chat/utils/capture-openable.ts`** (novo) — `export function isCaptureOpenable(capture: { kind: CaptureKind }, state: CaptureCardState): boolean { return capture.kind === 'reminder' && state !== 'error' }`. Os tipos vêm por `import type` de `@/api/models/message` e `@/pages/chat/components/capture-card/types`.
17. (RT-003) **`M/pages/chat/utils/__tests__/capture-openable.test.ts`** (novo) — T15: lembrete com `'error'` → `false`; lembrete com `'default'` → `true`. Casos extras: task e nota com `'default'` → `false`.
18. (RT-004) **`M/layout/stores/menu-store.ts`** — `export type MenuOrigin = 'menu' | 'chat'`. Acrescentar `origin: MenuOrigin` à interface e ao `INITIAL_STATE` (`'menu' as MenuOrigin`), mais a ação `openReminderFromChat: (reminderId: string) => void`, implementada como `set({ view: 'reminders', detailTarget: { kind: 'reminder', id: reminderId }, origin: 'chat' })`. O `reset()` continua `set(INITIAL_STATE)` e por isso já devolve `origin` a `'menu'`.
19. (RT-004) **`M/layout/stores/__tests__/menu-store.test.ts`** (novo) — T14: `useMenuStore.getState().openReminderFromChat('r1')` → `view === 'reminders'`, `detailTarget` igual a `{ kind: 'reminder', id: 'r1' }`, `origin === 'chat'`; depois `reset()` → `origin === 'menu'`, `view === 'menu'`, `detailTarget === null`. Chamar `reset()` num `beforeEach` (o store é global).
20. (RT-003, RT-004) **`M/pages/chat/hooks/use-open-reminder-from-chat.ts`** (novo) — `export function useOpenReminderFromChat()` devolve `useCallback((reminderId: string) => { if (useMenuStore.getState().origin === 'chat') return; useMenuStore.getState().openReminderFromChat(reminderId); router.push(ROUTES.menu) }, [])`. Usa o `router` de `expo-router`, como `chat-history-item.tsx`, e `ROUTES` de `@/core/routes`. O estado é gravado antes do `push` (armadilha do reconhecimento). A guarda pela origem barra o segundo toque (CB-005) e se desfaz no `reset()` que `M/pages/menu/page.tsx:24` chama ao desmontar.
21. (RT-001, RT-003) **`M/pages/chat/components/chat-history/chat-capture-card.tsx`** (novo) — `export function ChatCaptureCard({ capture }: { capture: MessageCapture })`, com o JSX que hoje está em `chat-history-item.tsx:76-89`, mais:
    - `const label = capture.reminderKind ? getCaptureReminderLabel({ kind: capture.reminderKind, recurrence: capture.recurrence ?? null }, language) : undefined`, com `language` de `useLanguage()`;
    - `<CaptureCard.Meta label={label}>{capture.meta}</CaptureCard.Meta>` quando `capture.meta` existe;
    - `<CaptureCard.KindPill>{label}</CaptureCard.KindPill>` quando não há `meta`, `capture.reminderKind === 'conditional'` e há `label`;
    - `CaptureCard.Action` com o `onAction` de hoje (só renderiza para task).
    
    Quando `isCaptureOpenable(capture, 'default')` (o chat não passa `state` ao `Root` hoje), o card fica dentro de `<Pressable accessibilityRole="button" onPress={() => openReminderFromChat(capture.itemId)} className="self-start active:opacity-60">`, que é o `TappableCard` de `parts.tsx:20-34` sem a prop `pressed`. Quando não, o card é renderizado sem `Pressable`. O `className="mt-0"` do `Root` fica. Se `self-start` mudar a largura do card em relação a `prototipo/v2.png`, tirar o `self-start` e registrar no relatório.
22. (RT-003) **`M/pages/chat/components/chat-history/chat-history-item.tsx`** — trocar o bloco das l.76-89 por `{capture && <ChatCaptureCard capture={capture} />}` e remover os imports que ficarem sem uso (`CaptureCard`, `ROUTES`, `router`, se nada mais os usar).
23. (RT-004) **`M/layout/components/menu-reminders/menu-reminders-view.tsx`** — ler `origin` de `useMenuStore` e trocar o `onBack={goBackToMenu}` (l.20) por `onBack={origin === 'chat' ? () => router.back() : goBackToMenu}`, com `router` de `expo-router`. O menu é um `Stack.Screen` com `presentation: 'modal'` em `packages/infra/mobile/ben/app/(protected)/_layout.tsx`, e a conversa continua montada por baixo: o `back()` volta a ela no mesmo ponto (AC-009) e desmonta o menu, que chama `reset()`.
24. (infra, limpeza final exigida pela Base do protótipo; não é pré-requisito de outro passo; último passo, depois do 21 e do 13, que usam o protótipo como referência visual) **remover `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/` e `packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/`** — apagar só essas duas pastas (`alarme-tela-cheia` e `header-menu-footer` ficam). As duas não estão no git (aparecem como `??`), então basta apagá-las do disco, sem `git rm`. Depois, `grep -rn "lembrete-criado-abrir-tela" packages/infra/mobile/ben/app packages/infra/mobile/ben/src` tem que sair vazio. Se houver um índice de protótipos apontando para elas, remover a entrada.

## Marcos de validação

### Marco 1 — checkpoint 1 de 3
prova: RT-001 (lado do domínio), RT-002
lane: teste
provas: T01, T02, T03, T04, T05, T06, T07
motivo: o formato da `CaptureView` (`reminderKind` e `recurrence`) é o que o contrato do app, o rótulo, o card, a lista e o detalhe consomem nos dois checkpoints seguintes. Um erro aqui, como `none` chegando diferente de `null` ou a repetição antiga no histórico, só apareceria nas fotos do fim e obrigaria a refazer o rótulo e os testes do app. A lane `teste` não sobe app nenhum.

## Ondas
onda única

## Contratos
- Domínio, `CaptureView`: `{ kind: MessageCaptureKind; itemId: string; title: string; meta: string | null; reminderKind: ReminderKind | null; recurrence: GoalRecurrence | null }`. Para lembrete, `recurrence` é `null` salvo em goal com `daily` ou `weekdays`. Para task e nota, os dois são `null`.
- HTTP (sem mudança de presenter): `capture` na resposta de criação e no histórico carrega os dois campos novos.
- App, `MessageCapture`: `reminderKind?: ReminderKind | null`, `recurrence?: GoalRecurrence | null`.
- `getRecurrenceLabel(schedule, language): string | null` e `getCaptureReminderLabel(schedule, language): string`, com `schedule = { kind: ReminderKind; recurrence: GoalRecurrence | null }`.
- `isCaptureOpenable(capture: { kind: CaptureKind }, state: CaptureCardState): boolean`.
- `menu-store`: `origin: 'menu' | 'chat'`, `openReminderFromChat(reminderId: string): void`.

## Fixtures
veredito: sem mecanismo
a mudar: nada. O estado de partida das provas é montado à mão, descrito por extenso em `## Preparo do estado das provas`.

## Plano de teste
lane: browser, teste, codigo
ambiente: `pnpm dev` na raiz (server :3333 + Expo web :8081), com `BACKEND_URL=http://localhost:3333` no `.env.development` do app (hoje aponta para um túnel ngrok; a linha localhost está comentada e :3333 está fora do ar). `pnpm dev:mobile` sozinho NÃO serve: sem o server o chat não carrega histórico nem lembretes. A galeria (`pnpm dev:design`) não participa. Prints: `playwright-core` + Chrome local, uma tela inteira por print, 390x844, escala 1x, nome do PNG com o id (como em `.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1.png`).
estado: nenhum (sem mecanismo; ver `## Preparo do estado das provas`)
url: http://localhost:8081/chat — chat do app em português (pt-BR), relógio do navegador fixo em 7/nov/2026, histórico com os lembretes da Ana (ver `[Visual] Dados` da spec), 390x844

### Roteiro — lane browser
S01 (PR-003; AC-005, AC-007) [final] (era vídeo) o usuário encosta e segura o dedo num card antigo da conversa ("Ligar pro dentista") → o card aparece em estado pressionado (mais claro que os outros) e a conversa continua na tela
S02 (PR-003; AC-005, AC-006) [final] o usuário solta o toque no card antigo "Ligar pro dentista" → a lista de lembretes aparece com o detalhe de "Ligar pro dentista" aberto por cima
S03 (PR-003; AC-008) [final] o usuário fecha o detalhe → a lista de lembretes fica na tela com a linha "Ligar pro dentista" nela
S04 (PR-003; AC-009) [final] o usuário toca no voltar da lista → a conversa aparece no mesmo ponto de antes, sem passar pela lista do menu
S05 (PR-003; AC-006) [final] o usuário toca no card do lembrete mais recente → o detalhe aberto é o do lembrete mais recente, não o do card antigo
S06 (PR-003; CB-005) [final] o usuário toca duas vezes rápido num card → o detalhe aparece numa tela só (nada empilhado por baixo)
S07 (PR-003; CB-011, AC-009) [final] o usuário volta pelo botão voltar do navegador uma vez → a conversa aparece
S08 (PR-004; AC-001, AC-002, AC-003, AC-004, AC-005, AC-019) [final] o usuário olha a conversa em português com os sete lembretes → os cards mostram, junto do horário, "Único" (alarme), "Único" (goal), "Todo dia", "Dias úteis", "Seg, Qui" e, no sem horário, "Quando acontecer"
S09 (PR-004; AC-001, AC-002, AC-003, AC-004) [final] o usuário troca o idioma para inglês e olha a conversa → os cards mostram "One-time", "Every day", "Weekdays", "Mon, Thu" e "When it happens"
S10 (PR-004; AC-010, AC-019, CB-001) [final] o usuário abre a lista de lembretes em português → cada linha ativa e a concluída ("Pagar o aluguel") mostram o rótulo de repetição ("Todo dia · capturado há ...", "Único", "Seg, Qui") e o selo de tipo; a linha "quando acontecer" mostra só o selo "Quando acontecer"
S11 (PR-004; AC-010) [final] o usuário abre a lista de lembretes em inglês → as linhas mostram "Every day", "One-time", "Weekdays", "Mon, Thu"
S12 (PR-004; AC-011, AC-002) [final] o usuário abre o detalhe do alarme "Ligar pro dentista" → o box mostra horário, "ativo", "Alarme" e a linha "Único"
S13 (PR-004; AC-011, AC-002) [final] o usuário abre o detalhe de um goal sem repetição → o box mostra "Goal" e a linha "Único"
S14 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Tomar o remédio" → o box mostra a linha "Todo dia"
S15 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Academia" → o box mostra a linha "Dias úteis"
S16 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Regar as plantas" → o box mostra a linha "Seg, Qui"
S17 (PR-004; AC-011, AC-004) [final] o usuário abre o detalhe de "Ver se a encomenda chegou" → o box mostra o selo "Quando acontecer" e nenhuma linha de repetição repetindo o texto
S18 (PR-004; AC-011, CB-001) [final] o usuário abre o detalhe de "Pagar o aluguel" → o box mostra "concluído", o rótulo "Único" e nenhum editor abaixo
S19 (PR-004; AC-011, AC-003) [final] em inglês, o usuário abre o detalhe de "Tomar o remédio" → o box mostra a linha "Every day"
S20 (PR-004; AC-011, AC-003) [final] em inglês, o usuário abre o detalhe de "Regar as plantas" → o box mostra a linha "Mon, Thu"
S21 (PR-005; AC-012, AC-018) [final] (era vídeo) o usuário toca no card de um goal sem repetição e olha o detalhe → o box mostra "Único" e o editor mostra "Repetir" com "Não" marcado
S22 (PR-005; AC-012, AC-018) [final] o usuário marca "Diária" e salva → o detalhe passa a mostrar a linha "Todo dia"
S23 (PR-005; AC-012) [final] o usuário fecha o detalhe → a linha desse lembrete na lista mostra "Todo dia"
S24 (PR-005; CB-010) [final] o usuário volta à conversa e recarrega a página → o card desse lembrete mostra "Todo dia"
S25 (PR-006; CB-003) [final] o usuário toca no card com o servidor respondendo devagar → o carregando do detalhe aparece por cima da lista
S26 (PR-006; CB-002) [final] o usuário toca num card cujo lembrete foi removido do banco antes → o detalhe mostra "este item sumiu — deve ter sido apagado em outro lugar."
S27 (PR-006; CB-002, AC-009) [final] o usuário fecha o detalhe que sumiu e toca no voltar da lista → a lista aparece ao fechar e, ao voltar, a conversa
S28 (PR-006; CB-004) [final] o usuário toca no card com o servidor falhando → o detalhe mostra "não deu para carregar — toque para tentar de novo"
S29 (PR-006; CB-004) [final] o usuário toca no card sem conexão → o detalhe mostra "não deu para carregar — toque para tentar de novo"
S30 (PR-006; CB-004) [final] o usuário toca em "tentar de novo" com o servidor de volta → o detalhe do lembrete aparece ali mesmo
S31 (PR-006; CB-004, AC-009) [final] o usuário fecha o detalhe com erro e volta pela lista → a conversa aparece
S32 (PR-006; CB-012, AC-008) [final] o usuário abre o detalhe pelo card com a lista falhando e fecha o detalhe → a lista mostra o aviso de falha com "tentar de novo"
S33 (PR-007; AC-013) [final] (era vídeo) o usuário toca no botão do card de task → a task abre como hoje
S34 (PR-007; AC-014) [final] o usuário toca no card de nota → nada abre e a conversa continua na tela
S35 (PR-007; AC-015) [final] o usuário pressiona e segura a bolha de texto do Ben → o menu de ações da mensagem abre
S36 (PR-007; AC-016) [final] o usuário toca no botão do topo da conversa → a lista do menu abre (Tarefas, Notas, Lembretes...)
S37 (PR-007; AC-017) [final] o usuário entra em Lembretes e toca num lembrete da lista → o detalhe abre por cima da lista
S38 (PR-007; AC-017) [final] o usuário fecha o detalhe → a lista de lembretes fica na tela
S39 (PR-007; AC-016) [final] o usuário toca no voltar da lista (aberta pelo menu) → a lista do menu aparece, não a conversa
S40 (PR-007; AC-016) [final] depois de já ter aberto um card pelo chat e voltado, o usuário abre o menu pelo botão do topo, entra em Lembretes e toca no voltar → a lista do menu aparece, não a conversa
S41 → lane codigo (seção `S41 / AC-020 — lane codigo` abaixo); desvio aprovado no gate 4.2
S42 (PR-008; CB-007) [final] o Ben responde criando dois lembretes de uma vez → a resposta mostra um card só, o do primeiro
S43 (PR-008; CB-007, AC-010) [final] o usuário abre a lista de lembretes depois dessa resposta → os dois lembretes estão na lista, cada um com o rótulo de repetição
S44 (PR-008; CB-009, AC-005) [final] o usuário recarrega a conversa depois de o lembrete do card ter sido removido do banco → a mensagem aparece sem card
S45 (PR-010; AC-001, AC-003) [final] o usuário diz ao Ben "me lembra de tomar o remédio todo dia às 8" → a resposta traz o card com "Todo dia"
S46 (PR-010; AC-006, AC-011) [final] o usuário toca no card → o detalhe do lembrete certo abre com a linha "Todo dia"
S47 (PR-010; AC-008) [final] o usuário fecha o detalhe → a lista de lembretes mostra o lembrete criado com "Todo dia"
S48 (PR-010; AC-009) [final] o usuário toca no voltar da lista → a conversa aparece com a resposta do Ben e o card

### Roteiro — lane teste
comando: `pnpm test` na raiz (ou `pnpm --filter @ben/domain-chat test:unit` e `pnpm --filter @ben/mobile-ben test:unit`)
T01 (PR-001; AC-001, AC-002) [marco 1] `packages/domain/chat/src/application/use-cases/captures/__tests__/persist-captures.test.ts` — alarme criado pela conversa → a view traz tipo "alarme" e nenhuma repetição
T02 (PR-001; AC-002) [marco 1] mesmo arquivo — goal com repetição "nenhuma" e goal sem valor de repetição → a view traz tipo "goal" e a mesma ausência de repetição nos dois
T03 (PR-001; AC-003) [marco 1] mesmo arquivo — goal que repete todo dia → a view traz a repetição diária
T04 (PR-001; AC-003) [marco 1] mesmo arquivo — goal de segunda a sexta → a view traz os dias 1 a 5
T05 (PR-001; AC-003) [marco 1] mesmo arquivo — goal em dias quaisquer (segunda e quarta) → a view traz esses dias
T06 (PR-001; AC-004) [marco 1] mesmo arquivo — lembrete "quando acontecer" → a view traz tipo "conditional", sem horário e sem repetição
T07 (PR-001; AC-005, CB-008, RT-002) [marco 1] `packages/domain/chat/src/application/use-cases/captures/__tests__/resolve-capture.test.ts` — lembrete cuja repetição mudou depois da criação → a view resolvida traz a repetição atual
T08 (PR-002; AC-002) [final] `packages/infra/mobile/ben/src/layout/utils/__tests__/recurrence-label.test.ts` — alarme, goal "nenhuma" e goal sem valor → "Único" em pt-BR e "One-time" em en
T09 (PR-002; AC-003) [final] mesmo arquivo — repetição diária → "Todo dia" e "Every day"
T10 (PR-002; AC-003) [final] mesmo arquivo — segunda a sexta (1 a 5) → "Dias úteis" e "Weekdays"
T11 (PR-002; AC-003) [final] mesmo arquivo — os sete dias marcados → "Todo dia" e "Every day"
T12 (PR-002; AC-003) [final] mesmo arquivo — segunda e quarta → "Seg, Qua" e "Mon, Wed"
T13 (PR-002; AC-004) [final] mesmo arquivo — "quando acontecer" → "Quando acontecer" e "When it happens" no card, e sem rótulo de repetição na lista e no detalhe
T14 (RT-004; AC-016) [final] `packages/infra/mobile/ben/src/layout/stores/__tests__/menu-store.test.ts` — abre pelo chat e chama `reset()` → a origem "chat" some e a vista volta à do menu
T15 (PR-009; CB-006) [final] `packages/infra/mobile/ben/src/pages/chat/utils/__tests__/capture-openable.test.ts` — card de lembrete em estado de erro → o toque não abre o detalhe; em estado normal, abre

### RT-003 — lane codigo
Procurar em: o diff de `packages/infra/mobile/ben/app/` e de `packages/infra/mobile/ben/src/core/routes.ts`; para a abertura, `packages/infra/mobile/ben/src/pages/chat/hooks/use-open-reminder-from-chat.ts` e `packages/infra/mobile/ben/src/pages/chat/components/chat-history/chat-capture-card.tsx`.
Reprova se:
- o diff cria ou altera arquivo em `packages/infra/mobile/ben/app/` (a remoção das pastas de protótipo `lembrete-criado-abrir-tela` é a única mudança permitida ali);
- o diff muda `packages/infra/mobile/ben/src/core/routes.ts`;
- a abertura pelo card não passa por `useMenuStore` (`openReminderFromChat`) seguido de `router.push(ROUTES.menu)`, por exemplo navegando para uma rota com id do lembrete ou com query string.

### S41 / AC-020 — lane codigo
Procurar em: o diff inteiro da task.
Reprova se o diff toca qualquer um destes caminhos (só importar `format-clock` sem alterá-lo é permitido):
- `packages/infra/mobile/ben/src/layout/components/alarm-popup/`;
- `packages/infra/mobile/ben/src/layout/stores/alarm-store.ts`;
- `packages/infra/mobile/ben/src/services/notifications-service*`;
- `packages/infra/mobile/ben/src/layout/hooks/use-alarm-scheduler*`;
- `packages/infra/mobile/ben/app/(protected)/_layout.tsx`.

## Preparo do estado das provas
> Seção nova: o projeto não tem mecanismo de fixtures; o estado de partida de cada prova é montado à mão (resposta 1 do usuário: misto).

- **(a) App apontando para o server local.** Em `packages/infra/mobile/ben/.env.development`, trocar `BACKEND_URL` para `http://localhost:3333`, guardando a linha original. Depois, `pnpm dev` na raiz. No fim das provas, restaurar a linha original e conferir que `git diff --stat` sai vazio para esse arquivo. Nunca commitar essa troca.
- **(b) JWT local.** Escolher um usuário da tabela `User` em `packages/infra/db/prisma/dev.db` e gerar o token com `jsonwebtoken`, com as mesmas opções de `packages/infra/adapters/src/services/jwt.ts:22` (`jwt.sign({ userId }, privateKey, {...})`) e o `JWT_PRIVATE_KEY` do `.env` do server (as chaves `JWT_PRIVATE_KEY` e `JWT_EXPIRATION_TIME_IN_SECONDS` vêm de `packages/modules/env/src/env.ts:18-19`). Exemplo: `node -e` dentro de `packages/infra/adapters`. Gravar o token em `localStorage['ben.jwttoken']` antes de abrir `/chat` (Playwright `addInitScript`).
- **(c) Dados da Ana** (spec, `[Visual] Dados`). Inserir no `dev.db`, para esse usuário, os seis lembretes (modelo `Reminder` de `packages/infra/db/prisma/schema.prisma`, props em JSON no formato que `persist-captures.ts` grava):
  - "Tomar o remédio": goal, `recurrence { type: 'daily' }`, 08:00;
  - "Ligar pro dentista": alarm, amanhã 09:00;
  - "Academia": goal, `recurrence { type: 'weekdays', weekdays: [1,2,3,4,5] }`, 07:00;
  - "Regar as plantas": goal, `recurrence { type: 'weekdays', weekdays: [1,4] }`, 18:00;
  - "Ver se a encomenda chegou": conditional, sem horário;
  - "Pagar o aluguel": alarm, concluído;
  - mais um goal com `recurrence { type: 'none' }`, para S13 e S21.
  
  Inserir também as mensagens do Ben com `capture { kind: 'reminder', itemId }` apontando cada lembrete, no formato que `packages/infra/server-ben/src/routes/chat.ts:225-233` grava. Conferir abrindo o histórico no app.
- **(d) Estados pontuais.** S26 e S44: `DELETE` da linha do lembrete em `Reminder` antes do toque (S26) ou da recarga (S44). S42: pedir ao Ben dois lembretes numa frase só. S45: o server precisa das chaves do provedor de IA no `.env`.
- **(e) Interceptação** (S08–S20, S25–S32). Token falso em `ben.jwttoken` e `page.route` nas chamadas a `BACKEND_URL`: histórico de mensagens (com `capture` trazendo `reminderKind` e `recurrence`), `reminders/list` e o detalhe por id. Os caminhos exatos são lidos em `page.on('request')` numa primeira carga. Por prova: atraso na resposta do detalhe para S25; 404 para S26; 500 para S28; `route.abort()` para S29; volta ao 200 para S30; `reminders/list` com 500 para S32.
- **(f) Navegador.** `context.clock` fixo em 2026-11-07. Viewport 390x844, escala 1x. Idioma en: pelas configurações do app ou pela chave `@ben/language` no `localStorage`.
- **(g) Backend real com os dados da Ana:** S01–S07, S21–S24, S33–S40 e S42–S48. S01–S07 e S33–S40 também usam o backend real, por estabilidade (decisão registrada no Resumo).

## Cobertura
4/4 RT · 10/10 PR · 12/12 CB
- RT-001 → T01–T07 na lane teste, S08, S45 na lane browser.
- RT-002 → T07 na lane teste, S24 na lane browser.
- RT-003 → seção `RT-003 — lane codigo`.
- RT-004 → T14 na lane teste, S39, S40 na lane browser.
- PR-001 → T01–T07 na lane teste.
- PR-002 → T08–T13 na lane teste.
- PR-003 → S01–S07 na lane browser.
- PR-004 → S08–S20 na lane browser.
- PR-005 → S21–S24 na lane browser.
- PR-006 → S25–S32 na lane browser.
- PR-007 → S33–S40 na lane browser e seção `S41 / AC-020 — lane codigo`.
- PR-008 → S42–S44 na lane browser.
- PR-009 → T15 na lane teste.
- PR-010 → S45–S48 na lane browser.
- CB-001 → PR-004 → S10, S18.
- CB-002 → PR-006 → S26, S27.
- CB-003 → PR-006 → S25.
- CB-004 → PR-006 → S28, S29, S30, S31.
- CB-005 → PR-003 → S06.
- CB-006 → PR-009 → T15.
- CB-007 → PR-008 → S42, S43.
- CB-008 → PR-001 → T07.
- CB-009 → PR-008 → S44.
- CB-010 → PR-005 → S24.
- CB-011 → PR-003 → S07.
- CB-012 → PR-006 → S32.

## Desvios da spec
- **PR-007 / AC-020, prova S41.** Sai da lane browser e vai para a lane codigo (seção `S41 / AC-020 — lane codigo`). O web não dispara alarme (`notifications-service.web.ts` é no-op), então o print não tem como mostrar o aviso. Aprovado pelo usuário no gate 4.2. O id S41 não é reaproveitado.
- **PR-009.** O "teste de componente" vira teste do predicado puro `isCaptureOpenable` (T15, passos 16 e 17). O app não tem testing-library e o `vitest.config.ts` só roda `.test.ts` em node. Resposta 2 do usuário no gate 4.2.

## Desvios de padrão
nenhum

## Riscos
- O `self-start` do `Pressable` (passo 21) pode mudar a largura do card em relação a `prototipo/v2.png`. O passo já diz o que fazer: tirar o `self-start` e registrar no relatório.
- Recarregar a página em `/menu` perde a origem "veio do chat", e o voltar passa a levar ao menu. É consequência de não haver rota nova (fora de escopo).
- Algum teste fora de `persist-captures.test.ts` e `resolve-capture.test.ts` pode montar `CaptureView` com `toEqual` de formato exato e quebrar com os dois campos novos. O typecheck e o `pnpm test` do checkpoint 1 acusam.
- S45 depende das chaves do provedor de IA no `.env` do server. Sem elas, a prova não roda.

## Premissas
- A galeria `packages/infra/mobile/design` fica fora da task.
- O rótulo de repetição é montado no app; o backend manda só o tipo e a repetição crus.
- Os dias aparecem na ordem segunda a domingo; `weekdays` vazio vira "Único"/"One-time"; alarme é sempre "Único"/"One-time", mesmo com repetição gravada.
- Sem `reminderKind` na resposta (server antigo), o card mostra só o horário, como hoje.
- A troca de `BACKEND_URL` em `.env.development` e os dados de prova (`dev.db`, JWT) ficam fora do diff e de qualquer commit.
- A memória que diz "recorrente não é v1" está desatualizada; vale o código, que já grava e edita repetição.
- O fluxo de dados persistentes não se aplica: nenhuma coluna muda, e `recurrence` já existe nas props JSON do lembrete.
- Os caminhos HTTP interceptados com `page.route` são lidos pelo tester na primeira carga, e não fixados aqui.
- Os inserts no `dev.db` seguem o formato que `persist-captures.ts` (lembretes) e `packages/infra/server-ben/src/routes/chat.ts:225-233` (mensagens com `capture`) gravam.
