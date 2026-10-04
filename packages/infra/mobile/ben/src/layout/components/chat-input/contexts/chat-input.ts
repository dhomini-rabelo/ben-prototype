import { createContext, useContext } from 'react'

export type ChatInputContextValue = {
  disabled: boolean
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
}

export const ChatInputContext = createContext<ChatInputContextValue | null>(
  null,
)

export function useChatInputContext() {
  const value = useContext(ChatInputContext)

  if (!value) {
    throw new Error('ChatInput parts must be used within ChatInput.Root')
  }

  return value
}
