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
          'w-full flex-row items-center gap-3',
          disabled && 'opacity-60',
          className,
        )}
      >
        {children}
      </View>
    </ChatInputContext.Provider>
  )
}
