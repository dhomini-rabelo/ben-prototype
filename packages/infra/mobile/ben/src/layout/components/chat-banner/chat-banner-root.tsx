import type { ReactNode } from 'react'
import { View } from 'react-native'
import { cn } from '@/layout/utils/styles'
import { ChatBannerToneContext, type ChatBannerTone } from './contexts/tone'

const toneClasses: Record<ChatBannerTone, string> = {
  info: 'bg-surface-container-low text-on-surface border-outline-variant/50',
  warn: 'bg-surface-container-low text-on-surface border-outline-variant/60',
  error: 'bg-surface-error text-text-error border-text-error/20',
}

type ChatBannerRootProps = {
  tone?: ChatBannerTone
  children: ReactNode
  className?: string
}

export function ChatBannerRoot({
  tone = 'info',
  children,
  className,
}: ChatBannerRootProps) {
  return (
    <ChatBannerToneContext.Provider value={tone}>
      <View
        accessibilityLiveRegion="polite"
        className={cn(
          'w-full flex-row items-center gap-3 rounded-xl border px-3.5 py-2.5',
          toneClasses[tone],
          className,
        )}
      >
        {children}
      </View>
    </ChatBannerToneContext.Provider>
  )
}
