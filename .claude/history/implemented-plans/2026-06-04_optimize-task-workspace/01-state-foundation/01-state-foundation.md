# Deep Plan — Plan 1 [Frontend] (sync): State foundation (stores, states, utils)

## Context

The task-workspace page currently runs on a single 304-line monolithic hook
(`project-web/src/pages/task-workspace/hooks/use-task-workspace.ts`) that mixes:
transient UI state (`draft`, `isAwaitingReply`, `lastBenReply`, `sendError`, `isMutating`),
voice/recording lifecycle (recorder + mic permission + transcription race-guard),
server mutations (`request*` calls + React-Query invalidation), and navigation.

The `pages/chat` feature already uses the target architecture we want to mirror:

- Transient state → **Zustand** stores (`stores/messages-store`, `stores/voice-store`, `stores/connectivity-store`).
- Draft text → **Jotai** atom (`states/chat-state.ts`).
- Derived display state → pure selectors (`select-voice-status.ts`).
- Low-level browser concerns → framework-generic plain modules (`recorder.ts`, `mic-permission.ts`).
- Components subscribe to stores via selectors (no prop drilling).

The one structural difference for task-workspace: **task data lives in React Query**
(`useTaskDetailData(taskId)` → `useAPIRequest`), not in a store. So store mutations must
talk to React Query imperatively through the **exported singleton** `queryClient`
(`project-web/src/api/client.ts`): read the live task from the cache, mutate the server,
then invalidate.

This plan is **CREATION-ONLY**. It creates new files exclusively under
`project-web/src/pages/task-workspace/{states,utils,stores}/`. It does **not** modify any
existing file. The old hook, components, and `page.tsx` stay untouched so the app keeps
building and running on the old hook until later plans wire the new layer in.

## Decisions

1. **Mirror chat exactly.** `voice-store` (index/types/select) is a near-verbatim copy of
   `chat/stores/voice-store/*`. The only behavioral change: on transcription success it
   routes the text through `useTaskStore.getState().sendText(text)` instead of chat's
   `useMessagesStore`.

2. **Reuse chat's low-level modules by import, do not duplicate.** `recorder.ts` and
   `mic-permission.ts` are framework-generic (depend only on the `MicPermission` type and
   browser APIs). The task voice-store imports `startRecorder/stopRecorder/cancelRecorder/
   releaseRecorder` from `../../../chat/stores/voice-store/recorder` and
   `subscribeMicPermission` from `../../../chat/stores/voice-store/mic-permission`.

3. **Reuse chat's connectivity store + hook by import.** Stores read offline via
   `useConnectivityStore.getState().isOffline` (from `../../../chat/stores/connectivity-store`).
   No new connectivity file. (Note: chat's connectivity is the single file
   `chat/stores/connectivity-store.ts`, not a folder — import path has no trailing segment.)

4. **Cache access is grounded, not guessed.** `useTaskDetailData(taskId)` calls
   `useAPIRequest({ url: API_ROUTES.tasks.detail(taskId) })` with **no** `params`.
   `useAPIRequest` keys its query `[url, params]`, so the live entry is
   `[API_ROUTES.tasks.detail(taskId), undefined]` holding `ItemResponse<Task>`.
   `getTaskFromCache` reads exactly that key. `invalidateTask` invalidates with the prefix
   key `[API_ROUTES.tasks.detail(taskId)]` (matches the `[url, undefined]` entry by prefix).

5. **`requestSendTaskMessage` returns `TaskMessageReply` (`{ benMessage, task }`).** The
   monolith used `reply.benMessage`; we keep that (not a raw string).

6. **`editText` gets real error handling.** The monolith's `handleTextEdit` was a
   fire-and-forget `.then(invalidate)` with no `.catch`. Per the briefing we wrap it in
   `try/catch` like the other mutations. There is no `sendError`/`isMutating` semantics
   defined for it in the monolith, so the catch swallows the error (consistent with the
   other no-op-on-failure mutations) — keeping the public contract `Promise<void>` and not
   inventing new state. This is the single intentional behavioral improvement.

7. **No hooks / no navigation in stores.** `finish()` returns `Promise<boolean>` (success)
   so the component can navigate; `setTaskId`/`reset` exist for the page lifecycle.

8. **`reset()` resets transient fields only**, not `taskId` (the page owns taskId via
   `setTaskId`). It restores `isAwaitingReply`, `lastBenReply`, `sendError`, `isMutating`
   to initial.

## Files to create (this plan OWNS these new paths)

All under `project-web/src/pages/task-workspace/`.

### `states/task-workspace-state.ts`
```ts
import { atom } from "jotai";

export const taskDraftAtom = atom("");
```

### `utils/diff-summary.ts`
```ts
import type { Task } from "../../../api/models/task";

export function diffSummary(task: Task | null): string {
  const changes = task?.pendingDiff?.changes;
  if (!changes) {
    return "";
  }
  if (changes.contentType === "todo") {
    const count = changes.items.filter(
      (item) => item.diff !== "unchanged",
    ).length;
    return `Ben suggested ${count} change${count === 1 ? "" : "s"}`;
  }
  return "Ben revised the draft";
}
```

### `utils/todo-order.ts`
```ts
import type { TodoItem } from "../../../api/models/task";

export function nextOrder(todoItems: TodoItem[]): number {
  return todoItems.reduce((max, item) => Math.max(max, item.order), -1) + 1;
}

export function sortByOrder(todoItems: TodoItem[]): TodoItem[] {
  return [...todoItems].sort((a, b) => a.order - b.order);
}
```

### `stores/task-store/types.ts`
```ts
export interface TaskStore {
  taskId: string;
  isAwaitingReply: boolean;
  lastBenReply: string | null;
  sendError: boolean;
  isMutating: boolean;

  setTaskId: (taskId: string) => void;
  sendText: (content: string) => Promise<boolean>;
  approveDiff: () => Promise<void>;
  rejectDiff: () => Promise<void>;
  toggleTodo: (itemId: string) => Promise<void>;
  addTodo: (title: string) => Promise<void>;
  editText: (value: string) => Promise<void>;
  finish: () => Promise<boolean>;
  reopen: () => Promise<void>;
  reset: () => void;
}
```

### `stores/task-store/index.ts`
Zustand `create<TaskStore>`. Internal helpers `getTaskFromCache` / `invalidateTask` use
the exported singleton `queryClient`. Each action ports the monolith logic exactly
(see Contracts table). `editText` adds try/catch.

### `stores/voice-store/types.ts`
Verbatim copy of `chat/stores/voice-store/types.ts` (`TranscriptionStatus`, `VoiceStatus`,
`MicPermission`, `VoiceStore`).

### `stores/voice-store/select-voice-status.ts`
Verbatim copy of chat's `select-voice-status.ts`.

### `stores/voice-store/index.ts`
Copy of chat's `voice-store/index.ts`, importing `recorder`/`mic-permission` from chat
(reuse, no duplication), with the single change in `onStop` success:
`void useTaskStore.getState().sendText(text)`.

## Existing code to reuse

| Concern | Reused from | How |
|---|---|---|
| `queryClient` singleton | `api/client.ts` | imported into task-store for read+invalidate |
| `API_ROUTES.tasks.*` | `api/routes.ts` | route keys |
| `ItemResponse<Task>`, `Task`, `TodoItem` | `api/types.ts`, `api/models/task.ts` | cache typing |
| `request*` task mutations | `api/requests/tasks.ts` | server calls |
| `requestTranscribeAudio` | `api/requests/transcription.ts` | voice-store transcription |
| recorder lifecycle | `chat/stores/voice-store/recorder.ts` | imported, not duplicated |
| mic permission subscription | `chat/stores/voice-store/mic-permission.ts` | imported, not duplicated |
| connectivity | `chat/stores/connectivity-store.ts` (`useConnectivityStore`) | `getState().isOffline` |
| connectivity hook | `chat/hooks/use-connectivity.ts` | consumed later by page (Plan 4) |

## Contracts — task-store action mapping

| Action | Monolith source | Behavior |
|---|---|---|
| `setTaskId(taskId)` | new | `set({ taskId })` |
| `sendText(content)` | `sendMessageText` 63–87 | trim; guard `!trimmed \|\| isAwaitingReply \|\| isOffline \|\| !taskId` → return `false`; set `isAwaitingReply:true, sendError:false`; `requestSendTaskMessage(taskId, trimmed)`; on ok set `lastBenReply = reply.benMessage`, invalidate, return `true`; catch → `sendError:true`, return `false`; finally `isAwaitingReply:false` |
| `approveDiff()` | `handleApproveDiff` 132–143 | guard `!taskId`; `isMutating:true`; `requestApproveTaskDiff`; invalidate; finally `isMutating:false` |
| `rejectDiff()` | `handleRejectDiff` 145–156 | same shape, `requestRejectTaskDiff` |
| `toggleTodo(itemId)` | `handleToggleTodo`+`persistTodos` 158–176 | read `todoItems` from cache; bail if absent/`!taskId`; map flip `done`; `requestUpdateTaskTodos`; invalidate |
| `addTodo(title)` | `handleAddTodo` 178–193 | trim; bail if `!trimmed \|\| !todoItems`; append `{id:crypto.randomUUID(), title:trimmed, done:false, order:nextOrder(todoItems)}`; `requestUpdateTaskTodos`; invalidate |
| `editText(value)` | `handleTextEdit` 195–202 | bail if `!taskId \|\| value === (task?.textContent ?? "")`; **try/catch** `requestUpdateTaskContent`; invalidate (NEW catch) |
| `finish()` | `handleFinish` 204–215 | guard `!taskId` → `false`; `isMutating:true`; `requestFinishTask`; return `true`; catch → `false`; finally `isMutating:false`. No navigation. |
| `reopen()` | `handleReopen` 217–228 | guard `!taskId`; `isMutating:true`; `requestReopenTask`; invalidate; finally `isMutating:false` |
| `reset()` | new | reset transient fields to initial |

## Public contract for later plans

- `taskDraftAtom` (Jotai) — `states/task-workspace-state.ts`
- `diffSummary`, `nextOrder`, `sortByOrder` — `utils/*`
- `useTaskStore` (+ `TaskStore` type) — `stores/task-store`
- `useVoiceStore`, `selectVoiceStatus`, types `VoiceStore/VoiceStatus/TranscriptionStatus/MicPermission` — `stores/voice-store`
- `useConnectivityStore`, `useConnectivity()` — reused from chat

## Verification

- `npx tsc --noEmit` in `project-web` passes (new files self-contained; old hook untouched).
- No existing file modified (git status shows only new files under the three dirs).
