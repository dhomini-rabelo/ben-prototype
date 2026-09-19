# R0 — Mapeamento chat mobile para feature "ver input/output" (long-press na mensagem do bot)

Escopo: `/root/so/repos/ben-prototype/project-mobile`, somente leitura. Objetivo: dar a outro agente o material para planejar a feature. Premissas assumidas quando algo era ambíguo estão marcadas com **[premissa]**.

## 1. Tela de chat — estrutura

- Página: `src/pages/chat/page.tsx` (componente `Chat`). Monta `ChatTopBar`, `ChatTopBanner`, `ChatHistory`/`ChatHistorySkeleton`/`ChatEmptyState`, `ActiveTaskPicker`, `ChatFooter`.
- Lista de mensagens: `src/pages/chat/components/chat-history/chat-history.tsx` — `FlatList` invertida (`inverted`), `renderItem` monta `<MessageBubble>` por item. É aqui que a interação de long-press teria que ser adicionada (dentro de `renderItem`, envolvendo o conteúdo de cada bolha).
- Bolha de mensagem: `src/pages/chat/components/message-bubble/message-bubble.tsx` — componente `MessageBubble({ from: 'user'|'ben', state?: 'default'|'pending'|'error'|'skeleton', children, footer, className })`. É puramente apresentacional (`View`/`Text`), **sem** `Pressable`/`TouchableOpacity` — hoje a bolha inteira não é tocável/pressionável de forma alguma. Adicionar long-press exigiria envolver `MessageBubble` (ou seu conteúdo) num `Pressable`/`GestureDetector`.
- Hooks: `use-chat-list.ts` (agrega histórico + mensagens de sessão, paginação `loadOlder`), `use-chat-messages.ts` (mescla histórico paginado com `sessionMessages` da store), `use-chat-input.ts`, `use-elapsed-timer.ts`, `use-keyboard-height.ts`, `use-microphone-permission.ts`, `use-scroll-to-bottom.ts`.
- Store: `src/pages/chat/stores/messages-store/index.ts` + `types.ts` (`MessagesStore`: `sessionMessages`, `isAwaitingReply`, `sendError`, `sendText`, `retrySend`, `stopTyping`) e `message-builders.ts` (`buildUserMessage`, `buildBenMessage`).

## 2. Modelo de dados da mensagem no cliente

Existem **duas representações diferentes e não 100% alinhadas**:

- `src/api/models/message.ts` — contrato "de rede" (histórico paginado): `Message { id, role: 'user'|'ben', content: string, createdAt: string, capture?: MessageCapture }`. `MessageCapture { kind: 'note'|'reminder'|'task', itemId, title, meta? }`.
- `src/pages/chat/utils/chat-messages.ts` — tipo usado na UI: `BenUiMessage = UIMessage<BenMessageMetadata>` (tipo `UIMessage` da lib **`ai`** — Vercel AI SDK), com `BenMessageMetadata = { capture?: MessageCapture }`. Mensagens têm `id`, `role: 'user'|'assistant'`, `parts: [{type:'text', text}]`, `metadata?`.
- Conversão histórico→UI: `use-chat-messages.ts` → `mapHistoryToUiMessages()` mapeia `Message[]` para `BenUiMessage[]`, jogando `capture` para dentro de `metadata.capture`.
- Resposta do envio de chat: `src/api/responses/agent-reply.ts` → `AgentReply { message: string, newReminders, newNotes, newTasks, historyTopics, capture: CaptureView | null }`. Requisição: `src/api/requests/chat.ts` → `requestSendChatMessage(text)` faz `POST /chat` com `{ messages: [{role:'user', parts:[{type:'text', text}]}] }`.

**O que NÃO existe hoje**: nenhum campo `input`/`output`/`log`/`debug`/`metadata` genérico por mensagem. O único "extra" por mensagem é `capture` (nota/lembrete/tarefa criada). Não há, em nenhum lugar do client, o prompt/input bruto enviado ao modelo nem a resposta/raciocínio bruto do agente associados a uma mensagem — só o texto final (`content`/`parts[].text`). **Para "ver input" e "ver output" existirem de verdade, o backend precisaria expor esses dados por mensagem (endpoint `/messages/list` e/ou `/chat`), e o tipo `Message`/`AgentReply`/`BenMessageMetadata` precisaria ganhar esses campos.** Isso é um requisito de escopo, não um detalhe de implementação — o agente que planejar deve confirmar com o usuário se o backend será alterado ou se "input/output" significa outra coisa (ex.: texto do usuário vs. texto do bot, que já existe).

## 3. Padrões existentes de long-press / gesture / modal / menu de ações

- **Long-press: não existe nenhum uso.** `grep -rn "onLongPress|LongPress"` em `src/` e `app/` não retornou nenhuma ocorrência. Não há `Gesture.LongPress`, nem `Pressable onLongPress`, nem lib de context-menu (não há `react-native-context-menu-view`, `ActionSheetIOS` não é usado). A feature de long-press → menu de opções seria **inédita** no app; precisa ser construída do zero (mas com as libs certas já instaladas: `react-native-gesture-handler` ~2.28, `react-native-reanimated` ~4.1 no `package.json`).
- **Modal / bottom sheet: padrão bem estabelecido**, dois componentes-molde reaproveitáveis:
  - `src/pages/chat/components/task-picker/task-picker-sheet.tsx` (`TaskPickerSheet`) — usa `Modal` (RN) `transparent animationType="none"` + `GestureHandlerRootView`/`GestureDetector` com `Gesture.Pan()` para arrastar-para-fechar + `Animated.View` (reanimated) para slide-in/backdrop fade. Props: `{ isOpen, count?, onClose, children }`.
  - `src/layout/components/menu-settings/settings-sheet-overlay.tsx` (`SettingsSheetOverlay`) — mesma ideia mas sem gesture-handler (só reanimated `withTiming`), props `{ isOpen, onClose, children }`. É o padrão mais simples e é o que hoje envolve os "modais de detalhe" (ver item 4).
  - Container visual do sheet: `src/layout/components/menu/menu-sheet.tsx` (`MenuSheet`) — `View` arredondado com "handle" no topo, `safe-area` no bottom. É o casco reutilizado por `SettingsSheet`, `ItemDetailRoot`, etc.
- **Menu de ações (lista de opções tipo "ver input"/"ver output"): não existe componente pronto.** O mais próximo é `MenuSheet`/`SettingsSheet` (linha de itens com `Pressable` + ícone + label), que serve de referência de estilo, mas não há um "action sheet" genérico de opções contextuais.

## 4. Padrão de tela de detalhe (modal vs. push screen)

Dois padrões distintos coexistem — útil para decidir onde a feature deve morar:

- **Modal (bottom sheet) para detalhe de item, dentro da mesma rota**: `app/(protected)/menu.tsx` → `src/pages/menu/page.tsx` (`Menu`). Usa `useMenuStore` (`src/layout/stores/menu-store.ts`, Zustand): campo `detailTarget: {kind:'note'|'reminder', id: string} | null`, ações `openDetail(target)` / `closeDetail()`. No JSX: `<SettingsSheetOverlay isOpen={detailTarget != null} onClose={closeDetail}><MenuSheet>{detailTarget.kind==='note' ? <NoteDetail .../> : <ReminderDetail .../>}</MenuSheet></SettingsSheetOverlay>`.
  - `NoteDetail`/`ReminderDetail` (`src/layout/components/menu-detail/note-detail.tsx`, `reminder-detail.tsx`) buscam dados via hook próprio (`useNoteDetailData(noteId)` etc.) e renderizam, em ordem fixa, `ItemDetailLoading` → `ItemDetailGone` (404) → `ItemDetailError` (com retry) → `ItemDetailContent` (título, corpo em `ScrollView` com `max-h-72`, metadados de captura/disparo). Casco comum: `ItemDetailRoot` (`kind`, ícone, label, botão fechar `X`).
  - **Este é o padrão mais próximo e reaproveitável para o modal de "ver input"/"ver output"**: reusar `SettingsSheetOverlay` + `MenuSheet`/`ItemDetailRoot` (ou um casco irmão) + um componente de conteúdo com os mesmos estados (loading/erro/vazio/conteúdo), especialmente se input/output vierem de uma nova chamada de API por mensagem.
- **Push screen (tela cheia via expo-router) para "workspace" de item**: `app/(protected)/tasks/[taskId].tsx` → `src/pages/task-workspace/page.tsx` (`TaskWorkspace`), navegado via `router.push(ROUTES.taskWorkspace(id))` (usado em `chat-history.tsx` no botão de `CaptureCard.Action`). Usa rota dinâmica `[taskId]` e store dedicada (`useTaskStore`, `setTaskId`).
- Rotas centralizadas em `src/core/routes.ts` (`ROUTES`) — não lido neste R0 além dos usos vistos (`ROUTES.menu`, `ROUTES.taskWorkspace(id)`); qualquer nova rota/entrada de navegação passaria por lá **[premissa: se a feature vier a precisar de uma rota nova em vez de modal, checar esse arquivo]**.

## 5. Logs / debug já existentes

Busca por `log|debug|trace` em `src/` e `app/` (case-insensitive) não encontrou nenhuma feature de logs/debug de mensagens — o único hit é um comentário incidental em `src/services/notifications-service.web.ts` sobre warnings de import, sem relação com o chat. **Não há precedente de UI de debug/log no app mobile.**

## Resumo do que muda o plano

1. Não existe long-press em lugar nenhum do app — será componente novo (`Pressable`/`Gesture.LongPress` em `react-native-gesture-handler`, já instalado).
2. Não há campos de input/output/log por mensagem no modelo de dados do cliente (`Message`, `BenUiMessage`/`BenMessageMetadata`, `AgentReply`) — feature depende de decisão/API do backend antes de codar a UI.
3. Padrão de modal de detalhe já existe e é reaproveitável quase 1:1: `SettingsSheetOverlay` + `MenuSheet`/`ItemDetailRoot` + componente de conteúdo com estados loading/gone/error/content, disparado por um campo tipo `detailTarget` numa store Zustand (`useMenuStore` é o exemplo, mas o chat teria a sua própria, provavelmente em `src/pages/chat/stores/`).
4. `MessageBubble` hoje não é tocável — precisa ganhar um wrapper pressable/gesture só no `renderItem` de `chat-history.tsx`, e provavelmente só quando `from === 'ben'` (a feature pede especificamente mensagens do bot).
