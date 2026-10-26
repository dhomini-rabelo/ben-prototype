import type { ReactNode } from 'react'
import { View } from 'react-native'
import { cn } from '@/layout/utils/styles'
import { CaptureCardContext } from './contexts/capture-card-context'
import { CaptureCardDogEar } from './capture-card-dog-ear'
import type { CaptureCardState, CaptureKind, TaskShape } from './types'

type CaptureCardRootProps = {
  kind: CaptureKind
  state?: CaptureCardState
  taskShape?: TaskShape
  children: ReactNode
  className?: string
}

const CARD_SHADOW = {
  shadowColor: '#1d1814',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 6,
  elevation: 2,
}

export function CaptureCardRoot({
  kind,
  state = 'default',
  taskShape = 'text',
  children,
  className,
}: CaptureCardRootProps) {
  const isError = state === 'error'
  const isPending = state === 'pending'
  const isFired = state === 'fired'
  const isFinished = state === 'finished'

  return (
    <CaptureCardContext.Provider value={{ kind, state, taskShape }}>
      <View
        style={CARD_SHADOW}
        className={cn(
          'mt-1.5 min-w-[224px] max-w-[286px] self-start rounded-[14px] bg-surface-container-lowest',
          isError && 'bg-surface-error',
          isPending && 'opacity-80',
          (isFinished || isFired) && 'bg-surface-container-low',
          className,
        )}
      >
        <View className="flex-row items-center gap-2.5 overflow-hidden rounded-[14px] py-2 pl-2 pr-3.5">
          {children}
          <CaptureCardDogEar />
        </View>
      </View>
    </CaptureCardContext.Provider>
  )
}
