import type { ReactNode } from 'react'
import { View } from 'react-native'
import { cn } from '@/layout/utils/styles'
import { ChatInputContext } from './contexts/chat-input'

type ChatInputRootProps = {
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
}

export function ChatInputRoot({
  draft,
  onDraftChange,
  onSend,
  disabled = false,
  children,
  className,
}: ChatInputRootProps) {
  return (
    <ChatInputContext.Provider
      value={{ draft, onDraftChange, onSend, disabled }}
    >
      <View
        className={cn(
          'w-full flex-row items-center rounded-full border border-transparent bg-surface-container-high px-2 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)]',
          disabled && 'opacity-60',
          className,
        )}
      >
        {children}
      </View>
    </ChatInputContext.Provider>
  )
}
