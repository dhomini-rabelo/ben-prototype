import type { ReactNode } from 'react'
import { Children } from 'react'
import { Text, View } from 'react-native'
import { formatClock } from '@/layout/components/alarm-popup/format-clock'
import { useLanguage } from '@/layout/hooks/use-strings'
import { cn } from '@/layout/utils/styles'
import { PulseView } from '@/pages/chat/components/pulse-view'
import { VoiceWave } from '@/pages/chat/components/voice-wave/voice-wave'

type MessageBubbleProps = {
  from: 'user' | 'ben'
  state?: 'default' | 'pending' | 'error' | 'skeleton'
  children?: ReactNode
  footer?: ReactNode
  createdAt?: string | null
  voiceDurationMs?: number | null
  className?: string
}

const TABULAR_NUMBERS = { fontVariant: ['tabular-nums' as const] }

function renderTextChild(child: ReactNode, index: number, textClass: string) {
  if (typeof child === 'string' || typeof child === 'number') {
    return (
      <Text key={index} className={textClass}>
        {child}
      </Text>
    )
  }
  return child
}

export function MessageBubble({
  from,
  state = 'default',
  children,
  footer,
  createdAt,
  voiceDurationMs,
  className,
}: MessageBubbleProps) {
  const language = useLanguage()
  const isBen = from === 'ben'
  const hasVoiceDuration =
    typeof voiceDurationMs === 'number' && voiceDurationMs > 0
  const shouldShowMeta = !isBen && (hasVoiceDuration || Boolean(createdAt))
  const textClass = cn(
    'font-sans text-[15px] leading-5',
    isBen ? 'text-on-surface' : 'text-ink',
    state === 'error' && 'text-text-error',
  )

  if (state === 'skeleton') {
    return (
      <View
        className={cn('w-full', isBen ? 'items-start' : 'items-end', className)}
      >
        <PulseView className="h-9 w-40 rounded-2xl rounded-tl-sm bg-outline-variant" />
      </View>
    )
  }

  return (
    <View
      className={cn('w-full', isBen ? 'items-start' : 'items-end', className)}
    >
      <View
        className={cn(
          'max-w-[286px] rounded-[20px] px-3.5',
          isBen
            ? 'rounded-tl-[6px] bg-bubble-ben py-[7px]'
            : 'rounded-br-[6px] bg-bubble-user pb-2 pt-[9px]',
          state === 'pending' && 'opacity-60',
          state === 'error' && 'border border-text-error/30 bg-surface-error',
        )}
      >
        {Children.map(children, (child, index) =>
          renderTextChild(child, index, textClass),
        )}
        {shouldShowMeta && (
          <View className="mt-[3px] flex-row items-center justify-end gap-1.5">
            {hasVoiceDuration && <VoiceWave durationMs={voiceDurationMs} />}
            {createdAt && (
              <Text
                className="font-sans text-[12px] leading-4 text-on-surface-variant"
                style={TABULAR_NUMBERS}
              >
                {formatClock(createdAt, language)}
              </Text>
            )}
          </View>
        )}
      </View>
      {footer}
    </View>
  )
}
