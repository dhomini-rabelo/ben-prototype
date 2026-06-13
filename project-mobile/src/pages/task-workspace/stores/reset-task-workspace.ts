import { useTaskChatStore } from './task-chat-store'
import { useTaskDiffStore } from './task-diff-store'
import { useTaskLifecycleStore } from './task-lifecycle-store'

// Coordinator for tearing down the task workspace. It lives above the individual
// stores so `task-store` (a leaf the children depend on) doesn't have to import
// them back — which is what previously created the require cycle.
export function resetTaskWorkspace(): void {
  useTaskChatStore.getState().reset()
  useTaskDiffStore.getState().reset()
  useTaskLifecycleStore.getState().reset()
}
