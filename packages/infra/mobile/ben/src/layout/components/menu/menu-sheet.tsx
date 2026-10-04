import type { ReactNode } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/layout/utils/styles'

type MenuSheetProps = {
  children: ReactNode
  className?: string
}

export function MenuSheet({ children, className }: MenuSheetProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className={cn(
        'w-full rounded-t-3xl bg-surface-container-lowest pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      <View className="items-center px-5 pt-3 pb-2">
        <View className="h-1 w-10 rounded-full bg-outline-variant/60" />
      </View>
      {children}
    </View>
  )
}
