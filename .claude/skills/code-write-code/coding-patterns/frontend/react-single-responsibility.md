# React Single Responsibility Patterns

A store, hook, or component should do exactly one thing. When a unit takes on a second responsibility, split it and compose the parts instead of growing the single unit.

## A hook owns one concern

When a hook both fetches data and drives unrelated UI orchestration, split it into focused hooks and compose them at the call site.

```tsx
// Wrong way — one hook owns fetching, filtering, and dialog state
function useTaskWorkspace() {
  // fetches tasks
  // computes the active filter
  // opens/closes the edit dialog
  // ...
}

// Correct way — one hook per concern, composed where needed
function useTaskListData() { /* fetching only */ }
function useTaskFilter() { /* derived filter only */ }
function useTaskDialogs() { /* dialog state only */ }
```

## A store owns one slice of state

A store that holds two unrelated slices should be two stores. Keep each store's actions scoped to the state it owns.

```tsx
// Wrong way — voice recording and chat draft in one store
const useChatStore = create(() => ({
  recordingState,
  startRecording,
  draftMessage,
  setDraftMessage,
}))

// Correct way — one store per slice
const useRecordingStore = create(() => ({ recordingState, startRecording }))
const useChatDraftStore = create(() => ({ draftMessage, setDraftMessage }))
```

## A component renders one thing

When a component grows to handle several distinct sections or states, extract each into its own component and let the parent compose them.

```tsx
// Wrong way — one component owns header, list, and footer logic
export function TaskPanel() {
  // header markup + handlers
  // list fetching + rendering
  // footer actions
}

// Correct way — compose focused components
export function TaskPanelRoot() {
  return (
    <>
      <TaskPanelHeader />
      <TaskPanelList />
      <TaskPanelFooter />
    </>
  )
}
```
