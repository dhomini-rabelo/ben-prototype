import { create } from 'zustand'

interface TaskStore {
  taskId: string
  setTaskId: (taskId: string) => void
}

// Leaf store: holds only the active task id. The child stores (chat/diff/
// lifecycle/content/todos) read it from here, so this module imports none of
// them — that one-way dependency is what keeps the workspace stores acyclic.
// Resetting the workspace lives in `reset-task-workspace.ts`, above the stores.
export const useTaskStore = create<TaskStore>((set) => ({
  taskId: '',

  setTaskId: (taskId) => set({ taskId }),
}))
