import type { CaptureKind } from '@/api/models/message'
import type { CaptureCardState } from '@/pages/chat/components/capture-card/types'

export function isCaptureOpenable(
  capture: { kind: CaptureKind },
  state: CaptureCardState,
): boolean {
  return capture.kind === 'reminder' && state !== 'error'
}
