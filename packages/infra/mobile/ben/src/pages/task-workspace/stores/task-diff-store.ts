import { create } from 'zustand'
import {
  requestApproveTaskDiff,
  requestRejectTaskDiff,
} from '@/api/requests/tasks'
import { invalidateTask } from './task-cache'
import { useTaskStore } from './task-store'

interface TaskDiffStore {
  isMutating: boolean
  approveDiff: () => Promise<void>
  rejectDiff: () => Promise<void>
  reset: () => void
}

export const useTaskDiffStore = create<TaskDiffStore>((set) => ({
  isMutating: false,

  approveDiff: async () => {
    const { taskId } = useTaskStore.getState()
    if (!taskId) {
      return
    }
    set({ isMutating: true })
    try {
      await requestApproveTaskDiff(taskId)
      await invalidateTask(taskId)
    } finally {
      set({ isMutating: false })
    }
  },

  rejectDiff: async () => {
    const { taskId } = useTaskStore.getState()
    if (!taskId) {
      return
    }
    set({ isMutating: true })
    try {
      await requestRejectTaskDiff(taskId)
      await invalidateTask(taskId)
    } finally {
      set({ isMutating: false })
    }
  },

  reset: () => set({ isMutating: false }),
}))
