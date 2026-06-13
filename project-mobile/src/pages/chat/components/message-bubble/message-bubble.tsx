import type { ReactNode } from 'react'
import { Children } from 'react'
import { Text, View } from 'react-native'
import { cn } from '@/layout/utils/styles'
import { PulseView } from '@/pages/chat/components/pulse-view'

type MessageBubbleProps = {
  from: 'user' | 'ben'
  state?: 'default' | 'pending' | 'error' | 'skeleton'
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

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
  className,
}: MessageBubbleProps) {
  const isBen = from === 'ben'
  const textClass = cn(
    'text-body-md',
    isBen ? 'text-on-surface' : 'text-on-primary',
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
      className={cn(
        'w-full flex-row',
        isBen ? 'justify-start' : 'justify-end',
        className,
      )}
    >
      <View
        className={cn(
          'max-w-[78%] flex-col gap-1',
          isBen ? 'items-start' : 'items-end',
        )}
      >
        <View
          className={cn(
            'rounded-2xl px-4 py-3',
            isBen
              ? 'rounded-tl-sm bg-surface-container-low'
              : 'rounded-tr-sm bg-primary',
            state === 'pending' && 'opacity-60',
            state === 'error' && 'border border-text-error/30 bg-surface-error',
          )}
        >
          {Children.map(children, (child, index) =>
            renderTextChild(child, index, textClass),
          )}
        </View>
        {footer}
      </View>
    </View>
  )
}
