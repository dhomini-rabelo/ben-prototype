import type { ReactNode } from 'react'
import { Typography } from '@/layout/components/ui/typography'
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
    <Typography
      variant="body-md"
      className="text-[13px] leading-snug text-on-surface-variant"
    >
      {children}
    </Typography>
  )
}
