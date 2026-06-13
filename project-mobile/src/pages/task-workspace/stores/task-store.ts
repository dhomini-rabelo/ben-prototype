import { create } from 'zustand'
import { useTaskChatStore } from './task-chat-store'
import { useTaskDiffStore } from './task-diff-store'
import { useTaskLifecycleStore } from './task-lifecycle-store'

interface TaskStore {
  taskId: string
  setTaskId: (taskId: string) => void
  reset: () => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  taskId: '',

  setTaskId: (taskId) => set({ taskId }),

  reset: () => {
    useTaskChatStore.getState().reset()
    useTaskDiffStore.getState().reset()
    useTaskLifecycleStore.getState().reset()
  },
}))
