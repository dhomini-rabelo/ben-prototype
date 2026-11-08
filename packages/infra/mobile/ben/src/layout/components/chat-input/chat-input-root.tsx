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
          'min-h-[44px] w-full flex-row items-end gap-1 rounded-[22px] border-[1.5px] border-field-border bg-surface-container-lowest px-1.5 py-[3px] shadow-[0_3px_10px_rgba(29,24,20,0.05)]',
          disabled && 'opacity-60',
          className,
        )}
      >
        {children}
      </View>
    </ChatInputContext.Provider>
  )
}
