# Implementation Plan 20 — Port the task-workspace logic cluster to `project-mobile`

> Code-level plan only. **Do not implement yet.** This plan ports the non-UI task-workspace logic (Zustand stores, Jotai draft state, pure utils, page hooks) from `project-web/src/pages/task-workspace/` into `project-mobile/src/pages/task-workspace/`. The cluster is platform-agnostic; the port is **copy-intact** except for three import/primitive adjustments forced by the platform: `task-cache.ts`'s `queryClient` source, `use-workspace-task.ts`'s route-param source, and `task-todos-store.ts`'s unique-id source.

## Context & references read

- **Brief:** `20-task-workspace-logic/start-briefing.md` + `20-task-workspace-logic/briefing/01-task-workspace-logic.md`. Owns only `src/pages/task-workspace/{stores,states,utils,hooks}/`. Depends on Phase 1 foundation + auth (plans 01–09) and the shared data hooks (plan 08). Runs in parallel with plan 21 (menu shell, owns `src/layout/components/menu*`) — distinct trees. Verification is `npx tsc --noEmit`; **no formatting/lint step** in this unit.
- **Reference source (web):** `project-web/src/pages/task-workspace/` — `stores/` (`task-store.ts`, `task-cache.ts`, `task-chat-store.ts`, `task-content-store.ts`, `task-todos-store.ts`, `task-diff-store.ts`, `task-lifecycle-store.ts`), `states/task-workspace-state.ts`, `utils/{diff-summary.ts,todo-order.ts}`, `hooks/{use-workspace-task.ts,use-workspace-input.ts}`. All read in full.
- **Design — `code-get-coding-designs` → Web Page Stores Structure:** `states/` holds ephemeral Jotai atoms; `stores/` holds one Zustand store per concern; a **root store** owns page identity (`taskId`) + a `reset()` that delegates to each child store via `getState()`; all file/folder names kebab-case. This cluster already matches the pattern exactly — preserve it 1:1.
- **`code-write-code`** (skipped `most-used-libraries` per task): keep existing conventions, no comments, self-explanatory code, kebab-case files, one export concern per file. The port keeps the web `request{Action}` names and the existing store shapes verbatim (no "tidying").

### Cross-plan dependencies (consumed here, NOT created here)

These must already exist when this plan runs (all are read-only inputs owned by earlier plans). The `@/*` path alias is set up by plan 01, so every aliased import resolves identically to web.

| Symbol (import path) | Owner | Used by |
|---|---|---|
| `queryClient` (`@/core/query-client`) | plan 01 | `task-cache.ts` — **moved from web's `@/api/client`** (see Adjustment A) |
| `Task`, `TodoItem` (`@/api/models/task`) | plan 04 | `task-cache.ts`, `diff-summary.ts`, `todo-order.ts`, `use-workspace-task.ts` |
| `API_ROUTES` (`@/api/routes`) | plan 04 | `task-cache.ts` |
| `ItemResponse<T>` (`@/api/types`) | plan 04 | `task-cache.ts` |
| `requestSendTaskMessage`, `requestUpdateTaskContent`, `requestUpdateTaskTodos`, `requestApproveTaskDiff`, `requestRejectTaskDiff`, `requestFinishTask`, `requestReopenTask` (`@/api/requests/tasks`) | plan 04 | chat/content/todos/diff/lifecycle stores |
| `useConnectivityStore` (`@/layout/stores/connectivity-store`) | plan 07 | `task-chat-store.ts` |
| `useTaskDetailData` (`@/layout/hooks/api/use-task-detail-data`) | plan 08 | `use-workspace-task.ts` |
| `useLocalSearchParams` (`expo-router`) | plan 01 deps | `use-workspace-task.ts` (Adjustment B) |
| `randomUUID` (`expo-crypto`) | plan 01 deps (precedent: plan 10) | `task-todos-store.ts` (Adjustment C) |

> If `tsc` later fails solely because one of these upstream symbols differs in name/path, fix only the single import line — the failure is an upstream dependency gap, not this unit's logic.

---

## Target folder layout (`project-mobile/src/pages/task-workspace/`)

```
src/pages/task-workspace/
├── states/
│   └── task-workspace-state.ts     # COPY INTACT  (Jotai draft atom)
├── utils/
│   ├── diff-summary.ts             # COPY INTACT  (pure)
│   └── todo-order.ts               # COPY INTACT  (pure)
├── stores/
│   ├── task-store.ts               # COPY INTACT  (root store + reset)
│   ├── task-cache.ts               # ADJUST A     (queryClient import source)
│   ├── task-chat-store.ts          # COPY INTACT
│   ├── task-content-store.ts       # COPY INTACT
│   ├── task-todos-store.ts         # ADJUST C     (crypto.randomUUID → expo-crypto)
│   ├── task-diff-store.ts          # COPY INTACT
│   └── task-lifecycle-store.ts     # COPY INTACT
└── hooks/
    ├── use-workspace-task.ts       # ADJUST B     (useParams → useLocalSearchParams)
    └── use-workspace-input.ts      # COPY INTACT
```

No `index.ts` / barrel / re-export-only files (forbidden per user memory rule). Components in later plans import each module directly.

---

## The three adjustments (call-outs)

### Adjustment A — `task-cache.ts`: `queryClient` import source

Web imports `queryClient` from `@/api/client`. On mobile the shared `QueryClient` lives in `@/core/query-client` (plan 04 explicitly does **not** export it from `client.ts`, and plan 01 owns it). **Only the import line changes**; both helper bodies stay identical.

```ts
import { queryClient } from "@/core/query-client";
import type { Task } from "@/api/models/task";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse } from "@/api/types";

export function getTaskFromCache(taskId: string): Task | null {
  const data = queryClient.getQueryData<ItemResponse<Task>>([
    API_ROUTES.tasks.detail(taskId),
    undefined,
  ]);
  return data?.item ?? null;
}

export function invalidateTask(taskId: string) {
  return queryClient.invalidateQueries({
    queryKey: [API_ROUTES.tasks.detail(taskId)],
  });
}
```

> The query-key shape `[API_ROUTES.tasks.detail(taskId), undefined]` (read) and `[API_ROUTES.tasks.detail(taskId)]` (invalidate) is preserved exactly — it must match the key built by `useAPIRequest` (plan 06) for cache reads to hit. The trailing `undefined` is the `params` slot of the generic hook's key; keep it verbatim.

### Adjustment B — `use-workspace-task.ts`: route-param source

Web reads the task id from react-router's `useParams<{ taskId: string }>()`. Mobile reads it from expo-router's `useLocalSearchParams`. The expo-router file route is `app/tasks/[taskId].tsx` (plan 01), so the param key is `taskId` — identical name, so the destructure + default are unchanged. Everything downstream (`useTaskDetailData`, the `state.data?.item ?? null` return) is identical.

```ts
import { useLocalSearchParams } from "expo-router";
import type { Task } from "@/api/models/task";
import { useTaskDetailData } from "@/layout/hooks/api/use-task-detail-data";

export function useWorkspaceTask(): Task | null {
  const { taskId = "" } = useLocalSearchParams<{ taskId: string }>();
  const { state } = useTaskDetailData(taskId);
  return state.data?.item ?? null;
}
```

> `useLocalSearchParams` types params as `string | string[]`; with the `<{ taskId: string }>` generic and the `= ""` default it narrows to `string` exactly like web's `useParams`. No call-site change needed; the page assembly plan (27) renders this hook inside the `[taskId]` route. (`useTaskStore.getState().taskId` is an alternative source, but the route param is the closer 1:1 swap and avoids ordering assumptions about when `setTaskId` runs — keep the route param.)

### Adjustment C — `task-todos-store.ts`: unique-id source

Web's `addTodo` generates the new item id with `crypto.randomUUID()`, which is not guaranteed in the Hermes RN runtime. Replace with `randomUUID()` from `expo-crypto` — synchronous, returns the same RFC-4122 UUID string shape, same uniqueness guarantee, so the single call site is the only change (this matches the established precedent set by plan 10 for the chat backbone). `expo-crypto` must be in `project-mobile`'s deps (`npx expo install expo-crypto`); plan 10 already requires it, so it should be present — if not, install it (do not hand-roll a `uid()` unless `expo install` fails).

```ts
import { create } from "zustand";
import { randomUUID } from "expo-crypto";
import { requestUpdateTaskTodos } from "@/api/requests/tasks";
import { nextOrder } from "@/pages/task-workspace/utils/todo-order";
import { getTaskFromCache, invalidateTask } from "./task-cache";
import { useTaskStore } from "./task-store";

interface TaskTodosStore {
  toggleTodo: (itemId: string) => Promise<void>;
  addTodo: (title: string) => Promise<void>;
}

export const useTaskTodosStore = create<TaskTodosStore>(() => ({
  toggleTodo: async (itemId) => {
    const { taskId } = useTaskStore.getState();
    const todoItems = getTaskFromCache(taskId)?.todoItems;
    if (!taskId || !todoItems) {
      return;
    }
    const next = todoItems.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    );
    await requestUpdateTaskTodos(taskId, next);
    await invalidateTask(taskId);
  },

  addTodo: async (title) => {
    const trimmed = title.trim();
    const { taskId } = useTaskStore.getState();
    const todoItems = getTaskFromCache(taskId)?.todoItems;
    if (!trimmed || !taskId || !todoItems) {
      return;
    }
    const next = [
      ...todoItems,
      {
        id: randomUUID(),
        title: trimmed,
        done: false,
        order: nextOrder(todoItems),
      },
    ];
    await requestUpdateTaskTodos(taskId, next);
    await invalidateTask(taskId);
  },
}));
```

> Only the import (`+ randomUUID from "expo-crypto"`) and the `id:` line (`crypto.randomUUID()` → `randomUUID()`) differ from web. All guards (trim, missing task, missing todos), the optimistic `next` array build, and the `request → invalidate` sequence are preserved verbatim.

---

## COPY-INTACT files (byte-for-byte from web; only on-disk location changes)

All imports below already use the `@/` alias or relative `./` paths that resolve identically once the cluster is in place. **No edits.**

### `states/task-workspace-state.ts`
Jotai draft atom holding the in-progress message text — decouples input editing from the chat store's send.
```ts
import { atom } from "jotai";

export const taskDraftAtom = atom("");
```

### `utils/diff-summary.ts`
Pure: turns a task's pending diff into a human-readable summary, preserving the todo-count (`Ben suggested N change(s)`, singular/plural) vs. draft-revision (`Ben revised the draft`) wording. Returns `""` when there is no pending diff.
```ts
import type { Task } from "@/api/models/task";

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
Pure: `nextOrder` computes the next ordering value (max existing `order` + 1, `-1`-seeded so an empty list yields `0`); `sortByOrder` returns a new array sorted ascending by `order`.
```ts
import type { TodoItem } from "@/api/models/task";

export function nextOrder(todoItems: TodoItem[]): number {
  return todoItems.reduce((max, item) => Math.max(max, item.order), -1) + 1;
}

export function sortByOrder(todoItems: TodoItem[]): TodoItem[] {
  return [...todoItems].sort((a, b) => a.order - b.order);
}
```

### `stores/task-store.ts`
Root store: holds the active `taskId`, exposes `setTaskId`, and `reset()` delegates to the three resettable child stores (chat, diff, lifecycle) via `getState()`. The page assembly plan (27) calls `setTaskId(taskId)` on mount and `reset()` on unmount.
```ts
import { create } from "zustand";
import { useTaskChatStore } from "./task-chat-store";
import { useTaskDiffStore } from "./task-diff-store";
import { useTaskLifecycleStore } from "./task-lifecycle-store";

interface TaskStore {
  taskId: string;
  setTaskId: (taskId: string) => void;
  reset: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  taskId: "",

  setTaskId: (taskId) => set({ taskId }),

  reset: () => {
    useTaskChatStore.getState().reset();
    useTaskDiffStore.getState().reset();
    useTaskLifecycleStore.getState().reset();
  },
}));
```
> `task-content-store` and `task-todos-store` are intentionally **not** in `reset()` (they are stateless action-only stores) — preserve this; do not add them.

### `stores/task-chat-store.ts`
Chat send store. Guards: empty/whitespace text, in-flight reply (`isAwaitingReply`), offline (`useConnectivityStore`), missing `taskId`. On send: set awaiting, call `requestSendTaskMessage`, invalidate the task, store `lastBenReply` from `reply.benMessage`; on failure set `sendError` (best-effort, returns `false`); `finally` clears awaiting. Exposes `isAwaitingReply`, `lastBenReply`, `sendError`, `sendText`, `reset`.
```ts
import { create } from "zustand";
import { requestSendTaskMessage } from "@/api/requests/tasks";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { invalidateTask } from "./task-cache";
import { useTaskStore } from "./task-store";

interface TaskChatStore {
  isAwaitingReply: boolean;
  lastBenReply: string | null;
  sendError: boolean;
  sendText: (content: string) => Promise<boolean>;
  reset: () => void;
}

export const useTaskChatStore = create<TaskChatStore>((set, get) => ({
  isAwaitingReply: false,
  lastBenReply: null,
  sendError: false,

  sendText: async (content) => {
    const trimmed = content.trim();
    const { taskId } = useTaskStore.getState();
    if (
      !trimmed ||
      get().isAwaitingReply ||
      useConnectivityStore.getState().isOffline ||
      !taskId
    ) {
      return false;
    }

    set({ isAwaitingReply: true, sendError: false });

    try {
      const reply = await requestSendTaskMessage(taskId, trimmed);
      await invalidateTask(taskId);
      set({ lastBenReply: reply.benMessage });
      return true;
    } catch {
      set({ sendError: true });
      return false;
    } finally {
      set({ isAwaitingReply: false });
    }
  },

  reset: () =>
    set({
      isAwaitingReply: false,
      lastBenReply: null,
      sendError: false,
    }),
}));
```
> `requestSendTaskMessage` returns `TaskMessageReply` (`{ task, benMessage }`) — only `reply.benMessage` is consumed, unchanged from web. Contract identical.

### `stores/task-content-store.ts`
Edits task text only when it actually changed (compares against the cached `textContent`), then invalidates. Swallows errors (best-effort, matching the other mutations' no-op-on-failure behavior — keep the existing comment).
```ts
import { create } from "zustand";
import { requestUpdateTaskContent } from "@/api/requests/tasks";
import { getTaskFromCache, invalidateTask } from "./task-cache";
import { useTaskStore } from "./task-store";

interface TaskContentStore {
  editText: (value: string) => Promise<void>;
}

export const useTaskContentStore = create<TaskContentStore>(() => ({
  editText: async (value) => {
    const { taskId } = useTaskStore.getState();
    const task = getTaskFromCache(taskId);
    if (!taskId || value === (task?.textContent ?? "")) {
      return;
    }
    try {
      await requestUpdateTaskContent(taskId, value);
      await invalidateTask(taskId);
    } catch {
      // Swallow: text edits are best-effort, matching the other mutations'
      // no-op-on-failure behavior.
    }
  },
}));
```
> This is the **one** intentional comment in the web source; copy it verbatim (it documents deliberate error-swallowing, not redundant narration of code).

### `stores/task-diff-store.ts`
Approve/reject the pending diff with a single `isMutating` in-flight guard; each action guards missing `taskId`, sets mutating, calls the request, invalidates, and clears mutating in `finally`. `reset()` clears `isMutating`.
```ts
import { create } from "zustand";
import {
  requestApproveTaskDiff,
  requestRejectTaskDiff,
} from "@/api/requests/tasks";
import { invalidateTask } from "./task-cache";
import { useTaskStore } from "./task-store";

interface TaskDiffStore {
  isMutating: boolean;
  approveDiff: () => Promise<void>;
  rejectDiff: () => Promise<void>;
  reset: () => void;
}

export const useTaskDiffStore = create<TaskDiffStore>((set) => ({
  isMutating: false,

  approveDiff: async () => {
    const { taskId } = useTaskStore.getState();
    if (!taskId) {
      return;
    }
    set({ isMutating: true });
    try {
      await requestApproveTaskDiff(taskId);
      await invalidateTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  rejectDiff: async () => {
    const { taskId } = useTaskStore.getState();
    if (!taskId) {
      return;
    }
    set({ isMutating: true });
    try {
      await requestRejectTaskDiff(taskId);
      await invalidateTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  reset: () => set({ isMutating: false }),
}));
```

### `stores/task-lifecycle-store.ts`
Finish/reopen the task with an `isMutating` guard. `finish` returns `boolean` (catches failure → `false`, no invalidate on the success path — preserve this asymmetry); `reopen` invalidates on success. `reset()` clears `isMutating`.
```ts
import { create } from "zustand";
import {
  requestFinishTask,
  requestReopenTask,
} from "@/api/requests/tasks";
import { invalidateTask } from "./task-cache";
import { useTaskStore } from "./task-store";

interface TaskLifecycleStore {
  isMutating: boolean;
  finish: () => Promise<boolean>;
  reopen: () => Promise<void>;
  reset: () => void;
}

export const useTaskLifecycleStore = create<TaskLifecycleStore>((set) => ({
  isMutating: false,

  finish: async () => {
    const { taskId } = useTaskStore.getState();
    if (!taskId) {
      return false;
    }
    set({ isMutating: true });
    try {
      await requestFinishTask(taskId);
      return true;
    } catch {
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  reopen: async () => {
    const { taskId } = useTaskStore.getState();
    if (!taskId) {
      return;
    }
    set({ isMutating: true });
    try {
      await requestReopenTask(taskId);
      await invalidateTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  reset: () => set({ isMutating: false }),
}));
```
> Preserve the deliberate difference between the two stores: `finish` has a `catch` returning `false` and does **not** invalidate (the caller navigates away on success); `reopen` invalidates with no `catch`. Do not "harmonize" them.

### `hooks/use-workspace-input.ts`
Binds the draft atom to the chat store's `sendText`. `handleDraftChange` writes the atom; `handleSend` reads the draft, optimistically clears it, fires `sendText`, and **restores** the draft if the send returns `false`. Uses `useAtomCallback` so the latest draft is read at call time. Returns `{ draft, handleDraftChange, handleSend }`.
```ts
import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { taskDraftAtom } from "@/pages/task-workspace/states/task-workspace-state";
import { useTaskChatStore } from "@/pages/task-workspace/stores/task-chat-store";

export function useWorkspaceInput() {
  const [draft, setDraft] = useAtom(taskDraftAtom);
  const sendText = useTaskChatStore((store) => store.sendText);

  const handleDraftChange = useCallback(
    (value: string) => setDraft(value),
    [setDraft],
  );

  const handleSend = useAtomCallback(
    useCallback(
      (get, set) => {
        const draft = get(taskDraftAtom);
        set(taskDraftAtom, "");
        void sendText(draft).then((sent) => {
          if (!sent) {
            set(taskDraftAtom, draft);
          }
        });
      },
      [sendText],
    ),
  );

  return { draft, handleDraftChange, handleSend };
}
```
> Jotai + `jotai/utils` are platform-agnostic (no DOM); copy intact. Pulls in `task-workspace-state.ts` and `task-chat-store.ts` from this same cluster, so it self-contains within the owned tree.

---

## Implementation order (when executed)

1. Create the four folders under `project-mobile/src/pages/task-workspace/`: `states/`, `utils/`, `stores/`, `hooks/`.
2. Copy intact: `states/task-workspace-state.ts`, `utils/diff-summary.ts`, `utils/todo-order.ts` (no dependencies on the rest).
3. Write `stores/task-cache.ts` with **Adjustment A** (`queryClient` from `@/core/query-client`).
4. Copy intact the four leaf stores: `task-content-store.ts`, `task-diff-store.ts`, `task-lifecycle-store.ts`, and `task-chat-store.ts` (the latter depends on the connectivity store, plan 07).
5. Write `stores/task-todos-store.ts` with **Adjustment C** (`expo-crypto` `randomUUID`). Confirm `expo-crypto` is installed; if absent, `npx expo install expo-crypto`.
6. Copy intact `stores/task-store.ts` (root) — must come after the three child stores it imports for `reset()`.
7. Write `hooks/use-workspace-task.ts` with **Adjustment B** (`useLocalSearchParams`); copy intact `hooks/use-workspace-input.ts`.

---

## Things explicitly NOT done here

- **No UI / components** — those are plans 22–24 and 27 (page assembly wires `setTaskId`/`reset` and renders these hooks/stores).
- **No barrel / index / re-export-only files** (user memory rule). Later plans import each module by its concrete path.
- **No router import inside `stores/`** — the route param is read only in `use-workspace-task.ts` via expo-router.
- **No renaming** of `request{Action}` functions or store/atom exports — copy-intact contract port.
- **No `QueryClient` creation** — `task-cache.ts` only *consumes* `@/core/query-client` (plan 01).
- **No formatting and no lint step** in this unit (per task). Verification is type-check only.
- **No changes outside `src/pages/task-workspace/{stores,states,utils,hooks}/`** — parallel-safe vs plan 21 (`src/layout/components/menu*`).

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with no errors. This confirms every cross-module reference resolves against the mobile project's API layer (plan 04), shared data hooks (plan 08), global stores (plan 07), the shared `QueryClient` (plan 01), and the `expo-router` / `expo-crypto` primitives. If `tsc` fails solely on a missing upstream module (`@/core/query-client`, `@/api/*`, `@/layout/*`, `expo-crypto`), the cause is an unfinished dependency plan (01/04/07/08), not this unit — do not work around it by changing import paths here.
