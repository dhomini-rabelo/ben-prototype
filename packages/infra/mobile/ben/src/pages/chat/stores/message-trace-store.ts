import { create } from 'zustand'

export type MessageTraceTab = 'input' | 'output'

export type MessageAnchor = {
  x: number
  y: number
  width: number
  height: number
}

export type MessageActionsTarget = {
  messageId: string
  createdAt: string | null
  anchor: MessageAnchor
}

export type MessageTraceTarget = {
  messageId: string
  createdAt: string | null
  tab: MessageTraceTab
}

interface MessageTraceStore {
  actionsTarget: MessageActionsTarget | null
  traceTarget: MessageTraceTarget | null
  openActions: (target: MessageActionsTarget) => void
  closeActions: () => void
  openTrace: (tab: MessageTraceTab) => void
  closeTrace: () => void
  reset: () => void
}

const INITIAL_STATE = {
  actionsTarget: null as MessageActionsTarget | null,
  traceTarget: null as MessageTraceTarget | null,
}

export const useMessageTraceStore = create<MessageTraceStore>((set, get) => ({
  ...INITIAL_STATE,
  openActions: (target) => set({ actionsTarget: target }),
  closeActions: () => set({ actionsTarget: null }),
  openTrace: (tab) => {
    const target = get().actionsTarget
    if (!target) return
    set({
      actionsTarget: null,
      traceTarget: {
        messageId: target.messageId,
        createdAt: target.createdAt,
        tab,
      },
    })
  },
  closeTrace: () => set({ traceTarget: null }),
  reset: () => set(INITIAL_STATE),
}))
