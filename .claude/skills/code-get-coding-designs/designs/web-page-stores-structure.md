# Web Page Stores Structure

How a `project-web` page organizes its client state when it grows beyond a single store. This sits next to the [page structure](./page-structure.md) `states/` convention: use `states/` for ephemeral Jotai UI atoms, and `stores/` for the page's Zustand domain stores. **All file and folder names use kebab-case**.

## Folder layout

```
{page-name}/
├── stores/
│   ├── {root}-store.ts          # root store: page identity + reset coordination
│   ├── {concern-a}-store.ts     # one store per concern
│   ├── {concern-b}-store.ts
│   └── {complex-store}/         # a store split into a folder when it grows
│       ├── index.ts             # create the store
│       ├── types.ts             # store interface + helper types
│       └── {concern}.ts         # extracted async/side-effect logic
```

## One store per concern

When a page holds several independent slices of domain state, split them into one store per concern (chat, diff, content, lifecycle, todos) instead of one large store. Components subscribe only to the store they need.

## Root store coordinates reset

A root store owns the page identity (e.g. the current id) and a `reset()` that delegates to each child store via `getState()`. The page calls `reset()` on unmount so navigating away clears every slice.

```ts
export const useTaskStore = create<TaskStore>((set) => ({
  taskId: '',
  setTaskId: (taskId) => set({ taskId }),
  reset: () => {
    useTaskChatStore.getState().reset()
    useTaskDiffStore.getState().reset()
    useTaskLifecycleStore.getState().reset()
  },
}))
```

```tsx
useEffect(() => {
  setTaskId(taskId)
  return () => useTaskStore.getState().reset()
}, [taskId, setTaskId])
```

## Split a large store into a folder

When a single store accumulates async side effects and data builders, promote it to a folder resolved through `index.ts` (the import path stays the same). `index.ts` creates the store and keeps its inline logic thin; `types.ts` holds the store interface and helper types (e.g. `StoreSet`/`StoreGet` aliases over Zustand's `StateCreator` params); each remaining concern (dispatch, builders, animation) moves to its own file and receives `set`/`get` as parameters.

```
messages-store/
├── index.ts             # create useMessagesStore, thin action bodies
├── types.ts             # MessagesStore interface + StoreSet/StoreGet
├── dispatch-reply.ts    # async orchestration (set, get, ...)
└── message-builders.ts  # pure data constructors
```
