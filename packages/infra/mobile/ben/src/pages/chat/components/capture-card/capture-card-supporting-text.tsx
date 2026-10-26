import type { ReactNode } from 'react'
import { Text } from 'react-native'
import { useCaptureCard } from './contexts/capture-card-context'

type CaptureCardSupportingTextProps = { children: ReactNode }

export function CaptureCardSupportingText({
  children,
}: CaptureCardSupportingTextProps) {
  const { state } = useCaptureCard()

  if (state === 'error') {
    return null
  }

  return (
    <Text
      numberOfLines={1}
      className="mt-px font-sans text-xs text-on-surface-variant"
    >
      {children}
    </Text>
  )
}
