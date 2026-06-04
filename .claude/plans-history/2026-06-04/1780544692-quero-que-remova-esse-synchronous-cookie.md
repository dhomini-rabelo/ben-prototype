# Plano — Remover o agrupador `useChatController` e o context `chat-actions` (com split em 3 stores)

## Context

A página de chat (`project-web/src/pages/chat/`) tem uma camada de indireção a ser removida:

- `hooks/use-chat-controller.ts` — **agrupador** que instancia `useConnectivity`, `useChatInput`, `useVoiceInput` e lê actions do store, devolvendo um objeto `ChatActions` memoizado.
- `contexts/chat-actions.ts` — React Context (`ChatActionsContext` + `useChatActions`) que distribui esse objeto.
- `components/chat-provider.tsx` — renderiza o `ChatActionsContext.Provider`.

Cinco componentes consomem o store/context: `ChatInput`, `RecordingBar`, `ChatHistory`, `ChatTopBanner` (via `useChatActions()`) e `ChatFooter` (via `useChatStore(selectVoiceStatus)`).

O objetivo é remover essa indireção e fazer os componentes consumirem **stores e hooks diretamente** (padrão "Zustand selectors / minimum props" do projeto).

### Decisões do usuário
1. **Voz → store** (não mais hook stateful compartilhado por context).
2. **Efeitos one-shot → `ChatScreen`** (não mais no provider).
3. **Dividir em 3 stores** para não inchar um único arquivo nem misturar domínios:
   - `messages-store` (mensagens)
   - `voice-store` (gravador/transcrição)
   - `connectivity-store` (online/offline)

### Restrições descobertas no mapeamento
- `hooks/use-connectivity.ts` é **compartilhado** com `task-workspace` → **NÃO deletar**; apenas reusar.
- `ChatFooter` também lê `selectVoiceStatus` → incluir na atualização.
- Tipos `TranscriptionStatus`/`VoiceStatus`/`MicPermission` só são usados dentro do chat (o `task-workspace` define seu próprio `VoiceStatus` local) → seguro movê-los para a `voice-store`.

---

## Stores resultantes (em `states/`)

### `states/messages-store.ts` → `useMessagesStore` (renomeado de `chat-store.ts`)
- **state:** `sessionMessages`, `isAwaitingReply`, `sendError`, `typingIntervalId`
- **actions:** `sendText`, `stopTyping`; helper interno `animateReply`; helpers `buildUserMessage`/`buildBenMessage`
- O guard de `sendText` passa a ler offline via `useConnectivityStore.getState().isOffline`.

### `states/connectivity-store.ts` → `useConnectivityStore` (novo)
- **state:** `isOffline`
- **action:** `setOffline`
- Alimentado pelo `ChatScreen`, que reusa o hook existente `useConnectivity()` num efeito (sem duplicar listeners de `window`).

### `states/voice-store.ts` → `useVoiceStore` (novo, recebe a lógica do gravador)
- **types:** `TranscriptionStatus`, `VoiceStatus`, `MicPermission` (movidos de `chat-store`/`use-media-recorder`).
- **state:** `transcription`, `isRecording`, `recorderError`, `micPermission`, `recordingSeconds`.
- **singleton de módulo** (variáveis `let` no topo do arquivo, fora do `create`): `recorder`, `stream`, `chunks`, `timer`, `transcriptionRunId`; + helpers `PREFERRED_MIME_TYPE`, `resolveMimeType()`, `isPermissionDeniedError()` (movidos de `use-media-recorder.ts`).
- **actions** (espelham `use-voice-input.ts` + `use-media-recorder.ts`, escrevendo direto no state):
  - `startRecording(): Promise<void>` — guarda em `micPermission === "denied" || useConnectivityStore.getState().isOffline`; `getUserMedia`; monta `MediaRecorder`; registra `ondataavailable`/`onstop`; inicia timer; `transcription: "idle"`.
  - `stopRecording()` — `transcription: "pending"`, para o recorder (dispara `onstop`).
  - `cancelRecording()` / `cancelTranscribing()` / `dismissError()` — cancelam/resetam recorder e voltam para `"idle"`, incrementando `transcriptionRunId` quando cancelam.
  - `retryVoice()` — `transcription: "idle"` + `get().startRecording()`.
  - `subscribeMicPermission(): () => void` — `navigator.permissions.query({name:"microphone"})` (set inicial + listener `change`); retorna cleanup que remove o listener **e** faz teardown de recorder/stream/timer ativos. Chamada uma vez pelo `ChatScreen`.
- **transcrição sem efeito React:** dentro do `onstop`, montar o `blob`, capturar `runId = ++transcriptionRunId`, chamar `requestTranscribeAudio(blob)`:
  - sucesso + `runId` válido → `useMessagesStore.getState().sendText(text)` + `transcription: "idle"`;
  - erro + `runId` válido → `transcription: "error"`.
- **selector:** `selectVoiceStatus(state)` (puro sobre o state da voice-store).

### `hooks/use-can-record.ts` → `useCanRecord()` (novo, substitui `selectCanRecord`)
Combina os 2 stores: `useVoiceStore((s) => s.micPermission) !== "denied" && !useConnectivityStore((s) => s.isOffline)`. (Padrão #5 "custom hooks for derived state" do minimum-props.)

**Reuso:** `sendText` já existe (era `onTranscribed`); `requestTranscribeAudio` de `api/requests/transcription`.

---

## Etapas

### Etapa 1 — Criar `connectivity-store.ts`
Store mínima `{ isOffline, setOffline }`.

### Etapa 2 — Criar `voice-store.ts`
Mover para cá a lógica de `use-media-recorder.ts` + `use-voice-input.ts` (conforme spec acima): tipos, singleton de módulo, actions, `subscribeMicPermission`, `selectVoiceStatus`, e transcrição no `onstop` chamando `useMessagesStore.getState().sendText`.

### Etapa 3 — Renomear `chat-store.ts` → `messages-store.ts`
Reduzir ao domínio de mensagens: remover state/actions de voz (`transcription`, `isRecording`, `recorderError`, `micPermission`, `recordingSeconds`, `setTranscription`, `syncRecorder`), conectividade (`isOffline`, `setOffline`) e os selectors de voz. Manter `sessionMessages`/`isAwaitingReply`/`sendError`/`typingIntervalId`, `sendText`, `stopTyping`, `animateReply`. Trocar `useChatStore` → `useMessagesStore`. Ajustar o guard de `sendText` para ler `useConnectivityStore.getState().isOffline`.

### Etapa 4 — Criar `hooks/use-can-record.ts`
`useCanRecord()` combinando voice-store + connectivity-store.

### Etapa 5 — Efeitos one-shot no `ChatScreen`
Arquivo: [chat-screen.tsx](project-web/src/pages/chat/components/chat-screen.tsx)
- `voiceStatus` ← `useVoiceStore(selectVoiceStatus)`.
- `const { isOffline } = useConnectivity();` + `useEffect(() => setOffline(isOffline), [isOffline, setOffline])` (setOffline da connectivity-store).
- `useEffect(() => stopTyping, [stopTyping])` (messages-store).
- `useEffect(() => useVoiceStore.getState().subscribeMicPermission(), [])`.

### Etapa 6 — Atualizar componentes consumidores
Remover `useChatActions`/context; ler direto dos stores certos:
- [chat-footer.tsx](project-web/src/pages/chat/components/chat-footer/chat-footer.tsx): `voiceStatus` ← `useVoiceStore(selectVoiceStatus)`.
- [chat-input.tsx](project-web/src/pages/chat/components/chat-input/chat-input.tsx): `useChatInput()` (handlers) + `startRecording`/`voiceStatus` ← `useVoiceStore` + `canRecord` ← `useCanRecord()` + `isOffline` ← `useConnectivityStore`.
- [recording-bar.tsx](project-web/src/pages/chat/components/recording-bar/recording-bar.tsx): `stopRecording`/`cancelRecording`/`recordingSeconds` ← `useVoiceStore` (deixa de importar messages-store).
- [chat-history.tsx](project-web/src/pages/chat/components/chat-history/chat-history.tsx): `cancelTranscribing`/`retryVoice`/`voiceStatus` ← `useVoiceStore`; `isAwaitingReply` ← `useMessagesStore`.
- [chat-top-banner.tsx](project-web/src/pages/chat/components/chat-top-banner/chat-top-banner.tsx): `retryVoice`/`dismissError`/`voiceStatus`/`micPermission` ← `useVoiceStore`; `isOffline` ← `useConnectivityStore`.

### Etapa 7 — Atualizar hooks restantes
- [use-chat-input.ts](project-web/src/pages/chat/hooks/use-chat-input.ts): `sendText` ← `useMessagesStore`.
- [use-chat-messages.ts](project-web/src/pages/chat/hooks/use-chat-messages.ts): `sessionMessages` ← `useMessagesStore`.

### Etapa 8 — Remover provider da página
[page.tsx](project-web/src/pages/chat/page.tsx): remover `ChatProvider`, renderizar `<ChatScreen />` direto (mantendo o efeito de auth com `Cookies`/`JWT_COOKIE`).

### Etapa 9 — Deletar arquivos mortos
- `hooks/use-chat-controller.ts`
- `contexts/chat-actions.ts` (e a pasta `contexts/` se ficar vazia)
- `components/chat-provider.tsx`
- `hooks/use-voice-input.ts`
- `hooks/use-media-recorder.ts`
- **Manter** `hooks/use-connectivity.ts` (usado pelo `task-workspace`).

### Etapa 10 — Verificar imports órfãos
`grep` em `project-web/src` por: `useChatStore`, `chat-store`, `useChatController`, `ChatActions`, `ChatActionsContext`, `useChatActions`, `ChatProvider`, `useVoiceInput`, `useMediaRecorder`, `syncRecorder`, `selectCanRecord`. Confirmar zero referências aos itens removidos e que `task-workspace` (que usa `useConnectivity`) segue intacto.

---

## Verificação

1. **Lint:** `cd project-web && npm run lint:fix`
2. **Types:** `cd project-web && npx tsc --noEmit`
3. **Runtime (manual / skill `run`):** abrir o chat e validar ponta-a-ponta:
   - enviar texto (draft → send → resposta animada do Ben);
   - voz: `startRecording` (ChatInput) → `RecordingBar` com segundos → `stopRecording` → bolha "transcribing" (ChatHistory) → texto transcrito enviado;
   - `cancelRecording` / `cancelTranscribing`;
   - erro de voz → banner com `Retry` (`retryVoice`) e `Dismiss` (`dismissError`);
   - offline (DevTools → Offline): banner offline + envio bloqueado; voltar online libera;
   - permissão de mic negada → banner correto (`micPermission === "denied"`);
   - confirmar que `ChatFooter` reage ao `voiceStatus` (peek some ao gravar).
