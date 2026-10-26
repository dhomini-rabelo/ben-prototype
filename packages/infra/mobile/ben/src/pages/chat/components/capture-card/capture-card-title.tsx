import type { ReactNode } from 'react'
import { Text } from 'react-native'
import { cn } from '@/layout/utils/styles'
import { useCaptureCard } from './contexts/capture-card-context'

type CaptureCardTitleProps = { children: ReactNode }

export function CaptureCardTitle({ children }: CaptureCardTitleProps) {
  const { state } = useCaptureCard()
  const isError = state === 'error'
  const isFinished = state === 'finished'
  const isFired = state === 'fired'

  return (
    <Text
      numberOfLines={1}
      className={cn(
        'font-sans-semibold text-[15px] leading-[19px]',
        isError && 'text-text-error',
        isFinished && 'text-on-surface-variant line-through',
        isFired && 'text-on-surface-variant',
        !isError && !isFinished && !isFired && 'text-ink',
      )}
    >
      {children}
    </Text>
  )
}
