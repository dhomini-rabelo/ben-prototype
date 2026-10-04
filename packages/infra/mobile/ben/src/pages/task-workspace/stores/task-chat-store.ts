import { create } from 'zustand'
import { requestSendTaskMessage } from '@/api/requests/tasks'
import { useConnectivityStore } from '@/layout/stores/connectivity-store'
import { invalidateTask } from './task-cache'
import { useTaskStore } from './task-store'

interface TaskChatStore {
  isAwaitingReply: boolean
  lastBenReply: string | null
  sendError: boolean
  sendText: (content: string) => Promise<boolean>
  reset: () => void
}

export const useTaskChatStore = create<TaskChatStore>((set, get) => ({
  isAwaitingReply: false,
  lastBenReply: null,
  sendError: false,

  sendText: async (content) => {
    const trimmed = content.trim()
    const { taskId } = useTaskStore.getState()
    if (
      !trimmed ||
      get().isAwaitingReply ||
      useConnectivityStore.getState().isOffline ||
      !taskId
    ) {
      return false
    }

    set({ isAwaitingReply: true, sendError: false })

    try {
      const reply = await requestSendTaskMessage(taskId, trimmed)
      await invalidateTask(taskId)
      set({ lastBenReply: reply.benMessage })
      return true
    } catch {
      set({ sendError: true })
      return false
    } finally {
      set({ isAwaitingReply: false })
    }
  },

  reset: () =>
    set({
      isAwaitingReply: false,
      lastBenReply: null,
      sendError: false,
    }),
}))
