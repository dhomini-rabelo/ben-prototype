# App Ben (mobile): descrição

> **Status: foco do desenvolvimento ativo.** É aqui que entram as features e mudanças.

**Pacote:** `@ben/mobile-ben`, em `packages/infra/mobile/ben`.

## Propósito

A implementação mobile do Ben, em React Native (Expo). Combina peças agnósticas de plataforma (cliente de API e contratos, estado com Zustand/Jotai, hooks do React Query, máquina de estados de voz, tokens de design) com apresentação e peças específicas de plataforma (primitivas de UI, navegação, áudio, auth, storage). Consome a API do [backend](../../backend/description.md).

Cobre: login com Google, chat com o agente Ben, o workspace de tarefas e o menu de navegação (tarefas, notas, lembretes, com detalhe e configurações), mais alarmes e notificações locais para lembretes. A folha de configurações escolhe modelo e esforço do agente, o idioma da interface (inglês `en` ou português `pt-BR`, padrão `en`), o switch "mostrar gasto em dólar" (desligado por padrão), o resumo diário (switch e horário) e o horário da manhã (`reminders-settings-section.tsx`) e lista as versões do app ("App versions"), cada uma expansível para ler o que mudou. Convenção: a cada release com funcionalidades testáveis, adicione uma entrada no topo de `APP_VERSIONS`, pois ela define a versão do Expo.

## Tela de chat

`src/pages/chat/page.tsx` monta três camadas: um cabeçalho fixo (`ChatTopBar` com `BrandMark`, a data curta de hoje e o botão de menu; abaixo dele a faixa de tarefas ativas `ActiveTaskPicker` e o `ChatTopBanner`), a lista de mensagens e o rodapé fixo com o composer (`ChatFooter`).

- **Faixa de tarefas**: `ActiveTaskPicker` mostra o `ActiveTaskPeek` (contagem e título da primeira tarefa ativa) logo abaixo da top bar e só renderiza quando há tarefas ativas; tocar abre a folha `TaskPickerSheet` com a lista, e escolher uma tarefa abre o workspace dela.
- **Lista**: `ChatHistory` é uma `FlatList` invertida alimentada por `useChatList`, que intercala as mensagens (da mais nova à mais antiga) com divisores de dia. `DayDivider` mostra "Hoje", "Ontem" ou a data curta, seguidos de `· N filed` quando o dia tem capturas do Ben. Rolar até o fim carrega a página mais antiga.
- **Balões** (`MessageBubble`): a mensagem do usuário tem fundo `bubble-user` e, no canto inferior, a duração da voz (`VoiceWave`: barras em `wave` mais `m:ss`, desenhadas só quando `voiceDurationMs > 0`) e a hora. A resposta do Ben usa `bubble-ben`, o avatar do `BenLogo` e o rodapé de custo quando a preferência está ligada. Falha de envio, transcrição e erro de voz aparecem como balão do usuário em estado `error` ou `pending` com rodapé de nova tentativa.
- **Captura**: a resposta do Ben que arquivou algo traz um `CaptureCard` logo abaixo do balão (ícone do tipo nota, lembrete ou tarefa, título, e para lembretes um selo com o horário, `capture.meta`, em `CaptureCardMeta`; orelha `CaptureCardDogEar`). O botão do card abre o workspace do item.
- **Composer**: `ChatInput` com campo de texto e `ChatInputActionFrame`, um botão redondo âmbar de 56 px dentro de um anel `brand-light`: seta para cima quando há texto digitado, microfone quando não há (desabilitado sem permissão). Durante a gravação o `RecordingBar` ocupa o lugar do composer.
- **Voz**: o hook de transcrição entrega texto, custo e duração da gravação, e `messagesStore.sendText` envia `voiceDurationMs` no `POST /chat`; o histórico devolve o campo e a duração volta ao balão. Mensagens digitadas não têm duração.

## Lembretes, alarmes e resumo diário

O layout autenticado (`app/(protected)/_layout.tsx`) liga `useAlarmScheduler`, o `AlarmPopupOverlay` e o `DailySummaryPopup`.

- `useAlarmScheduler` lê os lembretes ativos (`use-active-reminders-data`), checa a cada 15 s os que têm `nextFireAt` vencido e os enfileira no `alarm-store` (sem repetir o mesmo disparo, chave `id:firedAt`). Também sincroniza as notificações locais (`syncReminderNotifications` em `notifications-service`) e trata o toque numa notificação.
- `AlarmPopupOverlay` mostra o primeiro disparo da fila conforme o tipo do lembrete (`alarm`, `goal` ou `conditional`, componentes `alarm-popup-*`), com o modo de soneca (`alarm-popup-snooze`, opções vindas de `GET /reminders/:id/snooze-options`). Dispensar ou adiar chama `POST /reminders/:id/acknowledge`; marcar como concluído ou ajustar chama `POST /reminders/:id/update`.
- `useDailySummary` pede `GET /reminders/daily-summary` quando passa do horário configurado (se o resumo estiver ligado e ainda não tiver sido mostrado naquele dia, controle em `daily-summary-storage`, AsyncStorage) e mostra o `DailySummaryPopup`; também agenda uma notificação local diária.
- O menu de lembretes mostra o tipo de cada um (`ReminderKindBadge`) e o detalhe permite editar título, horário, alertas, recorrência ou frequência (`reminder-editor.tsx`, com `Switch` e `TimeStepper` de `components/ui/`).

## Idioma da interface

Todo texto da interface vive em dicionários tipados `Localized<T>` (um objeto `en` e um `pt-BR` com as mesmas chaves, que podem ser funções, por exemplo para plural e tempo relativo). Componentes leem com `useStrings(dicionario)`; código fora de componente usa `getStrings(dicionario)`. O idioma escolhido fica no `useLanguageStore` (Zustand), é gravado no AsyncStorage (`@ben/language`) e é restaurado no `auth-bootstrap` na abertura do app. Depois do login o servidor é a fonte de verdade: as preferências (`language`, `showUsdCost`) são lidas e gravadas por `/user-preferences/*` (`use-user-preferences-sync`, `user-preferences-store`); o valor local vale antes do login e enquanto carrega.

## Gasto em dólar

Quando o switch está ligado, o rodapé de cada resposta do Ben mostra o custo total da interação (`cost-footer.tsx`, formatado por `format-usd-cost.ts`, por exemplo `US$ 0,0123`). Respostas sem custo salvo não mostram rodapé. Os formatadores `relativeTime` e `absoluteDateTime` recebem o `language` e usam o locale de `LANGUAGE_LOCALES`. Textos vindos do backend ou do agente não são traduzidos.

## Regras visuais

Toda tela do Ben segue as [regras de design](../design/design-rules.md) e o design system em [design.md](../../../../agents-docs/design-advisor/design.md). Telas novas são desenhadas primeiro no [sandbox de design](../design/description.md). O tema do app (âmbar, Instrument Sans, ícones Phosphor) está em [technology-stack.md](./technology-stack.md); o sandbox (Tailwind v4, `lucide-react`, `global.css`) ainda não adotou esse tema.

## Mais contexto

- [technology-stack.md](./technology-stack.md)
- [project-structure.md](./project-structure.md)
- Padrões de código: [code-get-coding-designs](../../../code-get-coding-designs/SKILL.md) (API client, page stores, feature state components, services layer, token persistence) e [code-write-code](../../../code-write-code/SKILL.md).
