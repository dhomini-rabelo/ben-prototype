import type { ReactNode } from 'react'
import { Typography } from '@/layout/components/ui/typography'
import { useCaptureCard } from './contexts/capture-card-context'

type CaptureCardMetaProps = { children: ReactNode }

export function CaptureCardMeta({ children }: CaptureCardMetaProps) {
  const { state } = useCaptureCard()

  if (state === 'error') {
    return null
  }

  return (
    <Typography variant="label-caps" className="text-on-surface-variant/80">
      {children}
    </Typography>
  )
}
