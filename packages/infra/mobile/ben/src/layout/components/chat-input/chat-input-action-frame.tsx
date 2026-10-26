import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { cn } from '@/layout/utils/styles'

type ChatInputActionFrameProps = {
  label: string
  children: ReactNode
  onPress?: () => void
  disabled?: boolean
}

export function ChatInputActionFrame({
  label,
  children,
  onPress,
  disabled = false,
}: ChatInputActionFrameProps) {
  return (
    <View
      className={cn(
        'size-[68px] shrink-0 items-center justify-center rounded-full bg-brand-light',
        disabled && 'opacity-60',
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        disabled={disabled}
        className="size-14 items-center justify-center rounded-full bg-primary"
      >
        {children}
      </Pressable>
    </View>
  )
}
