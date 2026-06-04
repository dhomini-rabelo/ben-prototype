# Plan 1 [Frontend] (sync): State foundation — stores, states, utils

**Plan line:** Plan 1 [Frontend] (sync)
**Type:** Creation-only. This plan creates new files exclusively under `project-web/src/pages/task-workspace/states/`, `project-web/src/pages/task-workspace/stores/`, and `project-web/src/pages/task-workspace/utils/`. It modifies **NO existing files**. The current monolithic hook (`hooks/use-task-workspace.ts`), all existing components, and `page.tsx` stay untouched, so the app keeps building and running on the old hook while this layer is built.

All paths below are relative to `project-web/src/pages/task-workspace/`. Import paths shown in the contract are relative to each new file.

---

## Plan

1. **Create the draft-input state atom**
   - Add a Jotai atom file that holds the workspace text-input draft, mirroring chat's `states/chat-state.ts` (which exports `draftAtom`).
   - The state layer keeps draft text outside the stores so the input field can subscribe to it independently, with no prop drilling.

2. **Extract pure utilities out of the components and the monolith hook**
   - Move the diff-summary computation (currently inlined inside the diff-bar component) into a standalone pure function so any consumer can derive the human-readable summary from a task.
   - Move the next-order computation (currently inlined in the monolith hook) and the order-sorting computation (currently inlined in the todo-content component) into a standalone utility, preserving identical behavior.

3. **Build the task store (transient state + server mutations + cache invalidation)**
   - Create a Zustand store that owns all transient workspace state and performs every server mutation, porting the exact logic from the monolith hook.
   - Mutations read the live task (todo items / text content) directly from the React Query cache via the already-exported singleton `queryClient`, then invalidate the task query after writing. No new infrastructure is introduced.
   - Offline status is read imperatively from chat's existing connectivity store; navigation and React hooks stay out of the store (the success result is returned so a component can navigate).

4. **Build the voice store for the workspace**
   - Create a Zustand store that mirrors chat's voice store exactly (recording lifecycle, transcription run-id race guard, recording-seconds timer, mic-permission subscription, all actions), reusing chat's low-level recorder and mic-permission modules without duplicating them.
   - The only behavioral difference: on transcription success it routes the transcribed text through the new task store instead of chat's messages store.

5. **Reuse chat connectivity (no new files)**
   - Consumers reuse chat's existing connectivity store and connectivity hook; this plan adds nothing for connectivity.

---

## Files to create (this plan OWNS these new paths)

### `states/task-workspace-state.ts`
Jotai atom for the workspace draft input. Mirrors `chat/states/chat-state.ts`.
- **Exports:** `taskDraftAtom: PrimitiveAtom<string>` (initial value `""`, created with `atom("")` from `jotai`).

### `utils/diff-summary.ts`
The `diffSummary` pure function extracted verbatim (same behavior) from `components/diff-bar/diff-bar.tsx` lines 12–24. Imports `Task` from `../../../api/models/task`.
- **Exports:** `diffSummary(task: Task | null): string` — returns `""` when there is no pending diff; for a `todo` diff returns `` `Ben suggested ${count} change${count === 1 ? "" : "s"}` `` counting items whose `diff !== "unchanged"`; otherwise returns `"Ben revised the draft"`.

### `utils/todo-order.ts`
Pure todo-ordering helpers. Imports `TodoItem` from `../../../api/models/task`.
- **Exports:**
  - `nextOrder(todoItems: TodoItem[]): number` — extracted from `hooks/use-task-workspace.ts` lines 31–33: `todoItems.reduce((max, item) => Math.max(max, item.order), -1) + 1`.
  - `sortByOrder(todoItems: TodoItem[]): TodoItem[]` — extracted from `components/todo-content/todo-content.tsx` lines 38–40: returns a new array sorted ascending by `order` (`[...todoItems].sort((a, b) => a.order - b.order)`).

### `stores/task-store/types.ts`
The store interface. Imports nothing beyond TypeScript types.
- **Exports:** `interface TaskStore` with the shape:
  - State: `taskId: string`, `isAwaitingReply: boolean`, `lastBenReply: string | null`, `sendError: boolean`, `isMutating: boolean`.
  - Actions: `setTaskId(taskId: string): void`, `sendText(content: string): Promise<boolean>`, `approveDiff(): Promise<void>`, `rejectDiff(): Promise<void>`, `toggleTodo(itemId: string): Promise<void>`, `addTodo(title: string): Promise<void>`, `editText(value: string): Promise<void>`, `finish(): Promise<boolean>`, `reopen(): Promise<void>`, `reset(): void`.

### `stores/task-store/index.ts`
The Zustand store (`create<TaskStore>`). Holds the transient state and performs every server mutation plus cache invalidation. Internal (non-exported) helpers `getTaskFromCache(taskId)` and `invalidateTask(taskId)` use the exported singleton `queryClient`.
- **Imports:** `create` from `zustand`; `queryClient` from `../../../../api/client`; `API_ROUTES` from `../../../../api/routes`; `ItemResponse` from `../../../../api/types`; `Task`, `TodoItem` from `../../../../api/models/task`; `requestSendTaskMessage`, `requestApproveTaskDiff`, `requestRejectTaskDiff`, `requestUpdateTaskTodos`, `requestUpdateTaskContent`, `requestFinishTask`, `requestReopenTask` from `../../../../api/requests/tasks`; `useConnectivityStore` from `../../../chat/stores/connectivity-store`; `nextOrder` from `../../utils/todo-order`; `TaskStore` from `./types`.
- **Cache read (grounded):** `useTaskDetailData(taskId)` calls `useAPIRequest({ url: API_ROUTES.tasks.detail(taskId) })` with no `params`, and `useAPIRequest` uses `queryKey: [url, params]`. Therefore the live cache entry is keyed `[API_ROUTES.tasks.detail(taskId), undefined]` and holds `ItemResponse<Task>`. `getTaskFromCache` reads `queryClient.getQueryData<ItemResponse<Task>>([API_ROUTES.tasks.detail(taskId), undefined])?.item ?? null`. `invalidateTask` calls `queryClient.invalidateQueries({ queryKey: [API_ROUTES.tasks.detail(taskId)] })`.
- **Exports:** `useTaskStore` — a Zustand hook/store whose actions port the monolith logic exactly:
  - `setTaskId(taskId)` — store the active task id (new; the page sets it on mount).
  - `sendText(content)` — ported from `sendMessageText` (lines 63–87). Guards on empty-trim / `isAwaitingReply` / `useConnectivityStore.getState().isOffline` / missing `taskId`, returning `false`. Sets `isAwaitingReply: true, sendError: false`; calls `requestSendTaskMessage(taskId, trimmed)`; on success sets `lastBenReply` to the reply's `benMessage` and invalidates the task; on failure sets `sendError: true`; always clears `isAwaitingReply`. Returns `Promise<boolean>` (sent).
  - `approveDiff()` — ported from `handleApproveDiff` (132–143): guard on `taskId`; set `isMutating: true`; `requestApproveTaskDiff(taskId)`; invalidate; clear `isMutating` in `finally`.
  - `rejectDiff()` — ported from `handleRejectDiff` (145–156): same shape with `requestRejectTaskDiff`.
  - `toggleTodo(itemId)` — ported from `handleToggleTodo` + `persistTodos` (158–176): read `todoItems` from cache (bail if absent); map to flip `done` on the matching item; `requestUpdateTaskTodos(taskId, next)`; invalidate.
  - `addTodo(title)` — ported from `handleAddTodo` (178–193): guard empty-trim and missing `todoItems`; append `{ id: crypto.randomUUID(), title, done: false, order: nextOrder(todoItems) }`; `requestUpdateTaskTodos`; invalidate.
  - `editText(value)` — ported from `handleTextEdit` (195–202): guard missing `taskId` or `value === (task?.textContent ?? "")`; `requestUpdateTaskContent(taskId, value)`; invalidate. **Adds error handling** the current code lacks: wrap in `try/catch` like the other mutations instead of the current fire-and-forget `.then(...)`.
  - `finish()` — ported from `handleFinish` (204–215): guard `taskId`; set `isMutating: true`; `requestFinishTask(taskId)`; clear `isMutating` in `finally`. **Returns `Promise<boolean>`** (success). Navigation is NOT performed here — the component navigates on a `true` result.
  - `reopen()` — ported from `handleReopen` (217–228): guard `taskId`; set `isMutating: true`; `requestReopenTask(taskId)`; invalidate; clear `isMutating` in `finally`.
  - `reset()` — new: reset transient fields (`isAwaitingReply`, `lastBenReply`, `sendError`, `isMutating`) to initial; intended to be called on unmount.

### `stores/voice-store/types.ts`
Voice types, copied verbatim from `chat/stores/voice-store/types.ts`.
- **Exports:** `type TranscriptionStatus = "idle" | "pending" | "error"`; `type VoiceStatus = "idle" | "recording" | "transcribing" | "error"`; `type MicPermission = "granted" | "denied" | "prompt"`; `interface VoiceStore` with state `transcription`, `isRecording`, `recorderError: string | null`, `micPermission`, `recordingSeconds: number` and actions `startRecording(): Promise<void>`, `stopRecording(): void`, `cancelRecording(): void`, `cancelTranscribing(): void`, `retryVoice(): void`, `dismissError(): void`, `subscribeMicPermission(): () => void`.

### `stores/voice-store/select-voice-status.ts`
The `selectVoiceStatus` selector, copied verbatim from `chat/stores/voice-store/select-voice-status.ts`. Imports `VoiceStatus`, `VoiceStore` from `./types`.
- **Exports:** `selectVoiceStatus(state: VoiceStore): VoiceStatus` — returns `"recording"` while recording, `"transcribing"` when transcription is `pending`, `"error"` when transcription is `error` or `recorderError` is set, else `"idle"`.

### `stores/voice-store/index.ts`
The Zustand voice store (`create<VoiceStore>`), a copy of `chat/stores/voice-store/index.ts` with one change. It **reuses chat's low-level modules — does NOT duplicate them**.
- **Imports:** `create` from `zustand`; `requestTranscribeAudio` from `../../../../api/requests/transcription`; `useConnectivityStore` from `../../../chat/stores/connectivity-store`; `useTaskStore` from `../task-store`; `startRecorder`, `stopRecorder`, `cancelRecorder`, `releaseRecorder` from `../../../chat/stores/voice-store/recorder`; `subscribeMicPermission` from `../../../chat/stores/voice-store/mic-permission`; `VoiceStore` from `./types`.
- **The one behavioral change** vs. chat: inside `onStop`'s transcription-success branch, send through the task store rather than chat's messages store — replace `void useMessagesStore.getState().sendText(text)` with `void useTaskStore.getState().sendText(text)`. Everything else (the `transcriptionRunId` race guard, the `recordingSeconds` interval timer, the `subscribeMicPermission` lifecycle, reading offline via `useConnectivityStore.getState().isOffline`, and all action bodies) is identical to chat.
- **Exports:** `useVoiceStore` (Zustand store); re-export `selectVoiceStatus` from `./select-voice-status`; re-export types `MicPermission`, `TranscriptionStatus`, `VoiceStatus`, `VoiceStore` from `./types`.

---

## Public contract that later plans will consume

- **`taskDraftAtom`** — from `states/task-workspace-state.ts`.
- **`diffSummary`**, **`nextOrder`**, **`sortByOrder`** — from `utils/diff-summary.ts` and `utils/todo-order.ts`.
- **`useTaskStore`** — from `stores/task-store`. State selectors: `taskId`, `isAwaitingReply`, `lastBenReply`, `sendError`, `isMutating`. Actions: `setTaskId`, `sendText` (→ `Promise<boolean>`), `approveDiff`, `rejectDiff`, `toggleTodo`, `addTodo`, `editText`, `finish` (→ `Promise<boolean>`), `reopen`, `reset`. Plus `TaskStore` type from `stores/task-store/types`.
- **`useVoiceStore`** + **`selectVoiceStatus`** (status: `idle | recording | transcribing | error`) — from `stores/voice-store`. Exposes `recordingSeconds`, `micPermission`, and actions `startRecording`, `stopRecording`, `cancelRecording`, `cancelTranscribing`, `retryVoice`, `dismissError`, `subscribeMicPermission`. Plus types `VoiceStore`, `VoiceStatus`, `TranscriptionStatus`, `MicPermission`.
- **`useConnectivityStore`** (`isOffline`) and **`useConnectivity()`** — reused from chat; no new files.

---

## Out of scope

- Do not modify any existing component, the old `hooks/use-task-workspace.ts`, `hooks/use-workspace-task.ts`, or `page.tsx`.
- Do not duplicate chat's `recorder.ts` or `mic-permission.ts`; import them.
- Do not run `npm run lint:fix`.

## Verification

- `npx tsc --noEmit` should pass: the new files are self-contained and the old hook remains present and untouched, so the app still builds.
