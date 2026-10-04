import type { ReactNode } from 'react'
import { View } from 'react-native'

type CaptureCardBodyProps = {
  children: ReactNode
}

export function CaptureCardBody({ children }: CaptureCardBodyProps) {
  return <View className="min-w-0 flex-1 flex-col gap-0.5">{children}</View>
}
