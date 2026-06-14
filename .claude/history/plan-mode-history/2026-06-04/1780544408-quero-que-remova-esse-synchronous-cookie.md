# Plano — Remover o agrupador `useChatController` e o context `chat-actions`

## Context

Hoje a página de chat (`project-web/src/pages/chat/`) tem uma camada de indireção:

- `hooks/use-chat-controller.ts` — um **agrupador** que instancia `useConnectivity`, `useChatInput`, `useVoiceInput` e lê actions do store, devolvendo um objeto `ChatActions` memoizado.
- `contexts/chat-actions.ts` — um React Context (`ChatActionsContext` + `useChatActions`) que distribui esse objeto.
- `components/chat-provider.tsx` — renderiza o `ChatActionsContext.Provider` em volta da tela.

Quatro componentes (`ChatInput`, `RecordingBar`, `ChatHistory`, `ChatTopBanner`) consomem as actions via `useChatActions()`.

O objetivo é **remover essa indireção** e fazer os componentes consumirem **stores, hooks e actions diretamente** — alinhado com a estratégia de "minimum props / Zustand selectors" do projeto (`code-write-code` → minimum-props-strategies, padrão #1).

O único bloqueio real é que `useVoiceInput` + `useMediaRecorder` são **stateful** (guardam o `MediaRecorder`, stream, chunks e timers em refs). Eram instanciados **uma única vez** no controller e compartilhados via context; chamá-los direto em cada componente criaria gravadores separados e quebraria a gravação.

### Decisões do usuário
1. **Voz → store**: mover a lógica do gravador e as actions de voz para o `chat-store` (zustand). O recorder vira um singleton de módulo; componentes chamam as actions direto via `useChatStore`.
2. **Efeitos únicos → `ChatScreen`**: os efeitos que devem rodar uma vez (sincronizar conectividade via `setOffline`, cleanup de `stopTyping`, e o init/cleanup do recorder) ficam no `ChatScreen`.

---

## Resultado final

- `useChatInput` (stateless) → chamado direto no `ChatInput`.
- Actions de voz (`startRecording`, `stopRecording`, `cancelRecording`, `cancelTranscribing`, `retryVoice`, `dismissError`) → viram actions do `chat-store`, lidas direto onde forem usadas.
- Estado de voz (`isRecording`, `recorderError`, `micPermission`, `recordingSeconds`, `transcription`) → já vive no store; passa a ser escrito pelo próprio store (sem ponte `syncRecorder`).
- Efeitos one-shot → inline no `ChatScreen`.
- `ChatProvider`, `useChatController`, `useChatActions`/context, `useVoiceInput`, `useMediaRecorder` → **removidos**.

---

## Etapas

### Etapa 1 — Reescrever o `chat-store` para ser dono da voz
Arquivo: [chat-store.ts](project-web/src/pages/chat/states/chat-store.ts)

1. Trazer para o store (escopo de módulo, fora do `create`, como singleton não-React) as variáveis internas do gravador hoje em `use-media-recorder.ts`: `recorder: MediaRecorder | null`, `stream: MediaStream | null`, `chunks: Blob[]`, `timer` (interval), além de um `transcriptionRunId` (para invalidar transcrições canceladas).
2. Mover para cá os helpers de `use-media-recorder.ts`: `PREFERRED_MIME_TYPE`, `resolveMimeType()`, `isPermissionDeniedError()`, e o **type `MicPermission`** (hoje importado de `use-media-recorder`). Manter `MicPermission` exportado pelo store (ou por um `states/recorder.ts` colocalizado) para não quebrar o import existente.
3. **Remover** a action `syncRecorder` (a ponte hook→store deixa de existir).
4. Adicionar as actions de voz ao `ChatStore`, espelhando a lógica atual de `use-voice-input.ts` + `use-media-recorder.ts`, escrevendo direto no estado do store (`set({ isRecording, recorderError, micPermission, recordingSeconds })`):
   - `startRecording(): Promise<void>` — guarda em `micPermission === "denied" || isOffline` (pode reusar `selectCanRecord(get())`); `getUserMedia`, monta `MediaRecorder`, registra `ondataavailable`/`onstop`, inicia timer e marca `transcription: "idle"`.
   - `stopRecording()` — `set({ transcription: "pending" })` e para o recorder (dispara `onstop`).
   - `cancelRecording()` — cancela recorder/stream/timer, incrementa `transcriptionRunId`, reseta estado, `transcription: "idle"`.
   - `cancelTranscribing()` — incrementa `transcriptionRunId`, reseta recorder, `transcription: "idle"`.
   - `retryVoice()` — `transcription: "idle"` e chama `get().startRecording()`.
   - `dismissError()` — reseta recorder, `transcription: "idle"`.
   - `subscribeMicPermission(): () => void` — move o efeito de `navigator.permissions.query({name:"microphone"})` (set inicial + listener `change` → `set({ micPermission })`); retorna cleanup que remove o listener **e** faz teardown do recorder/stream/timer ativo. Será chamada uma vez pelo `ChatScreen`.
5. **Transcrição sem efeito React**: disparar dentro do `onstop` do recorder. Após montar o `blob`, guardar o `runId = ++transcriptionRunId` e chamar `requestTranscribeAudio(blob)` (import movido de `use-voice-input.ts`):
   - sucesso e `runId` ainda válido → `get().sendText(text)` + `set({ transcription: "idle" })`;
   - erro e `runId` válido → `set({ transcription: "error" })`.
   - (O guard `processedBlobRef` antigo deixa de ser necessário: cada parada gera um blob novo.)
6. Manter intactos: `sendText`, `stopTyping`, `setOffline`, `setTranscription`, `animateReply`, e os selectors `selectVoiceStatus` / `selectCanRecord`.

**Reuso:** `sendText` já existe no store (era passado como `onTranscribed`); agora é chamado direto. `requestTranscribeAudio` de `api/requests/transcription`.

### Etapa 2 — Mover os efeitos one-shot para o `ChatScreen`
Arquivo: [chat-screen.tsx](project-web/src/pages/chat/components/chat-screen.tsx)

Adicionar, no topo do componente (mantendo o render atual):
- `const { isOffline } = useConnectivity();` + `useEffect(() => setOffline(isOffline), [isOffline, setOffline])` (lendo `setOffline` do store).
- `useEffect(() => stopTyping, [stopTyping])` (cleanup de digitação).
- `useEffect(() => useChatStore.getState().subscribeMicPermission(), [])` (watch de permissão + teardown do recorder no unmount).

`useConnectivity` ([use-connectivity.ts](project-web/src/pages/chat/hooks/use-connectivity.ts)) é **mantido** e usado direto aqui.

### Etapa 3 — Atualizar os 4 componentes consumidores
Trocar `useChatActions()` por leitura direta de store/hook. Em cada um, remover o import de `../../contexts/chat-actions`.

- [chat-input.tsx](project-web/src/pages/chat/components/chat-input/chat-input.tsx): `const { handleDraftChange, handleSend } = useChatInput();` + `const startRecording = useChatStore((s) => s.startRecording);` (já importa `useChatStore`).
- [recording-bar.tsx](project-web/src/pages/chat/components/recording-bar/recording-bar.tsx): `const stopRecording = useChatStore((s) => s.stopRecording);` + `const cancelRecording = useChatStore((s) => s.cancelRecording);`.
- [chat-history.tsx](project-web/src/pages/chat/components/chat-history/chat-history.tsx): `const cancelTranscribing = useChatStore((s) => s.cancelTranscribing);` + `const retryVoice = useChatStore((s) => s.retryVoice);`.
- [chat-top-banner.tsx](project-web/src/pages/chat/components/chat-top-banner/chat-top-banner.tsx): `const retryVoice = useChatStore((s) => s.retryVoice);` + `const dismissError = useChatStore((s) => s.dismissError);`.

(O restante de cada componente — selectors de estado, render — não muda.)

### Etapa 4 — Remover o provider da página
Arquivo: [page.tsx](project-web/src/pages/chat/page.tsx)

Remover `ChatProvider` e renderizar `<ChatScreen />` direto (mantendo o `useEffect` de checagem de auth com `Cookies`/`JWT_COOKIE`).

### Etapa 5 — Deletar arquivos mortos
- `hooks/use-chat-controller.ts`
- `contexts/chat-actions.ts` (e a pasta `contexts/` se ficar vazia)
- `components/chat-provider.tsx`
- `hooks/use-voice-input.ts`
- `hooks/use-media-recorder.ts` (após mover `MicPermission` + helpers para o store na Etapa 1)

### Etapa 6 — Verificar imports órfãos
Antes de finalizar, `grep` no `project-web/src` por: `useChatController`, `ChatActions`, `ChatActionsContext`, `useChatActions`, `ChatProvider`, `useVoiceInput`, `useMediaRecorder`, `syncRecorder`, e `MicPermission`. Confirmar que não restou referência aos arquivos deletados e que `MicPermission` aponta para o novo local.

---

## Verificação

1. **Lint:** `cd project-web && npm run lint:fix`
2. **Types:** `cd project-web && npx tsc --noEmit`
3. **Runtime (manual / via skill `run`):** abrir a página de chat e validar o fluxo ponta-a-ponta:
   - enviar texto (draft → send → resposta do Ben com animação de digitação);
   - gravar voz: `startRecording` (ChatInput) → `RecordingBar` aparece com segundos → `stopRecording` → bolha "transcribing" no `ChatHistory` → texto transcrito é enviado como mensagem;
   - cancelar gravação e cancelar transcrição (`cancelRecording` / `cancelTranscribing`);
   - erro de voz → banner com `Retry` (`retryVoice`) e `Dismiss` (`dismissError`);
   - offline (DevTools → Offline): banner de offline e envio bloqueado; voltar online libera.
   - confirmar que a permissão de microfone negada mostra o banner correto (`micPermission === "denied"`).
