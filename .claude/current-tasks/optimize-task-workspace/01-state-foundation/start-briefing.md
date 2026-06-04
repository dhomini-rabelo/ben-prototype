# Plan 1 [Frontend] (sync): State foundation — stores, states, utils, types

**Plan line:** Plan 1 [Frontend] (sync)
**Justification:** This plan defines the entire state/logic contract that every other plan consumes. It must finish before anything else starts. It only creates **new** files under `task-workspace/states/`, `task-workspace/stores/`, and `task-workspace/utils/` — it does **not** modify any existing component, hook, or `page.tsx`, so the app keeps running on the current monolithic hook while this is built.

## Goal

Replace the 304-line monolithic `hooks/use-task-workspace.ts` logic with a chat-style state layer: Zustand stores + Jotai atom + pure selectors + extracted utils. This plan **builds** that layer (it does not yet wire it into components — that happens in later plans). The old hook stays in place and untouched until Plan 4.

## Why this architecture (mirrors `pages/chat`)

`pages/chat` keeps transient state in Zustand stores (`stores/messages-store`, `stores/voice-store`, `stores/connectivity-store`), draft text in a Jotai atom (`states/chat-state.ts`), derives display state with pure selectors (`select-voice-status.ts`), and keeps low-level concerns in plain modules (`recorder.ts`, `mic-permission.ts`). Components subscribe directly to stores via selectors — **no prop drilling**.

The one difference: task data lives in **React Query** (`useTaskDetailData` → `useAPIRequest`). The singleton `queryClient` is exported from `src/api/client.ts`, so store actions can mutate the server and then invalidate / read the cache imperatively:

```ts
import { queryClient } from "../../../../api/client";
import { API_ROUTES } from "../../../../api/routes";
import type { ItemResponse } from "../../../../api/types";
import type { Task } from "../../../../api/models/task";

const detailKey = (taskId: string) => [API_ROUTES.tasks.detail(taskId)];

function getTaskFromCache(taskId: string): Task | null {
  const data = queryClient.getQueryData<ItemResponse<Task>>([
    API_ROUTES.tasks.detail(taskId),
    undefined, // useAPIRequest queryKey is [url, params]; params is undefined here
  ]);
  return data?.item ?? null;
}

function invalidateTask(taskId: string) {
  return queryClient.invalidateQueries({ queryKey: detailKey(taskId) });
}
```

This is idiomatic React Query against an already-exported singleton — no new infrastructure.

## Files to create (this plan OWNS these new paths)

### `task-workspace/states/task-workspace-state.ts`
Jotai atom for the draft input (mirror `chat/states/chat-state.ts`):
```ts
import { atom } from "jotai";
export const taskDraftAtom = atom("");
```

### `task-workspace/utils/diff-summary.ts`
Extract the `diffSummary(task)` pure function currently inlined in `components/diff-bar/diff-bar.tsx` (lines 12–24). Same behavior.

### `task-workspace/utils/todo-order.ts`
- `nextOrder(todoItems: TodoItem[]): number` — extracted from the monolith hook (lines 31–33).
- `sortByOrder(todoItems: TodoItem[]): TodoItem[]` — returns a new array sorted by `order` (extract from `todo-content.tsx` lines 38–40).

### `task-workspace/stores/task-store/` (the task-thread + mutations store — analog of chat `messages-store`)
- `index.ts` — `useTaskStore` (Zustand). Holds transient state and performs every server mutation + cache invalidation.
- `types.ts` — the `TaskStore` interface.

**State:** `taskId: string`, `isAwaitingReply: boolean`, `lastBenReply: string | null`, `sendError: boolean`, `isMutating: boolean`.

**Actions (port the exact logic from the monolith hook):**
| action | source in monolith | behavior |
|---|---|---|
| `setTaskId(taskId)` | new | store the active taskId (page sets it on mount) |
| `sendText(content)` | `sendMessageText` (63–87) | guard trim/awaiting/offline; `requestSendTaskMessage(taskId, text)`; set `lastBenReply`; invalidate task; handle `sendError`; toggle `isAwaitingReply`. Returns `Promise<boolean>` (sent). Read offline from `useConnectivityStore.getState().isOffline`. |
| `approveDiff()` | `handleApproveDiff` (132–143) | set `isMutating`; `requestApproveTaskDiff`; invalidate; clear `isMutating` |
| `rejectDiff()` | `handleRejectDiff` (145–156) | same shape |
| `toggleTodo(itemId)` | `handleToggleTodo`+`persistTodos` (158–176) | read todoItems from cache; map toggle `done`; `requestUpdateTaskTodos`; invalidate |
| `addTodo(title)` | `handleAddTodo` (178–193) | read todoItems from cache; append with `nextOrder`; `requestUpdateTaskTodos`; invalidate |
| `editText(value)` | `handleTextEdit` (195–202) | guard equal to current `textContent` (from cache); `requestUpdateTaskContent`; invalidate. **Add error handling** (current code is fire-and-forget with no `.catch`) — wrap in try/catch like the other mutations. |
| `finish()` | `handleFinish` (204–215) | set `isMutating`; `requestFinishTask`; invalidate; clear `isMutating`; **return `Promise<boolean>`** (success). Navigation is NOT done here (no hooks in stores) — the component navigates on success. |
| `reopen()` | `handleReopen` (217–228) | set `isMutating`; `requestReopenTask`; invalidate; clear `isMutating` |
| `reset()` | new | reset transient fields (call on unmount) |

> Read the current task (todoItems / textContent) via `getTaskFromCache(get().taskId)`. Use `queryClient` invalidation as shown above. Keep all `request*` imports from `api/requests/tasks`.

### `task-workspace/stores/voice-store/` (analog of chat `voice-store`)
Mirror `chat/stores/voice-store` **exactly**, with one change: on transcription success it sends through the **task** store, not chat's messages store.
- `index.ts` — `useVoiceStore` (Zustand). Re-export `selectVoiceStatus`, types.
- `types.ts` — `VoiceStore`, `VoiceStatus`, `TranscriptionStatus`, `MicPermission` (copy from chat's voice-store types).
- `select-voice-status.ts` — copy chat's `selectVoiceStatus` verbatim.

**Reuse low-level modules from chat (do NOT duplicate):** import `startRecorder`, `stopRecorder`, `cancelRecorder`, `releaseRecorder` from `../../../../chat/stores/voice-store/recorder` and `subscribeMicPermission` from `../../../../chat/stores/voice-store/mic-permission`. These only depend on a `MicPermission` type and are framework-generic.

The store body is a copy of `chat/stores/voice-store/index.ts`, except inside `onStop`'s transcription success:
```ts
// chat does: void useMessagesStore.getState().sendText(text);
// here do:
void useTaskStore.getState().sendText(text);
```
Keep the `transcriptionRunId` race-guard, the `recordingSeconds` timer, `subscribeMicPermission` lifecycle, and all actions (`startRecording`, `stopRecording`, `cancelRecording`, `cancelTranscribing`, `retryVoice`, `dismissError`, `subscribeMicPermission`) identical to chat. Read offline from `useConnectivityStore.getState().isOffline`.

### Reuse (no new files) from chat
- Connectivity: reuse `chat/stores/connectivity-store` (`useConnectivityStore`) and `chat/hooks/use-connectivity` (`useConnectivity`). Stores read offline via `useConnectivityStore.getState().isOffline`. The page (Plan 4) will call `useConnectivity()` to drive it.

## Public contract that later plans will consume
- `useTaskStore` selectors: `isAwaitingReply`, `lastBenReply`, `sendError`, `isMutating`; actions `setTaskId`, `sendText`, `approveDiff`, `rejectDiff`, `toggleTodo`, `addTodo`, `editText`, `finish` (→ `Promise<boolean>`), `reopen`, `reset`.
- `useVoiceStore` + `selectVoiceStatus` (status: `idle|recording|transcribing|error`), plus `recordingSeconds`, `micPermission`, and actions `startRecording`, `stopRecording`, `cancelRecording`, `cancelTranscribing`, `retryVoice`, `dismissError`, `subscribeMicPermission`.
- `taskDraftAtom` (Jotai).
- `useConnectivityStore` (`isOffline`), `useConnectivity()` (from chat).
- utils: `diffSummary`, `nextOrder`, `sortByOrder`.

## Out of scope
- Do not modify any existing component, the old `hooks/use-task-workspace.ts`, `hooks/use-workspace-task.ts`, or `page.tsx`.
- Do not run `npm run lint:fix`.

## Verification
- `npx tsc --noEmit` should pass for the new files in isolation (they are self-contained; the old hook is still present and untouched, so the app still builds).
