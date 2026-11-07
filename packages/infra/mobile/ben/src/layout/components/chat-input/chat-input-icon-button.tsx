import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { cn } from '@/layout/utils/styles'

type ChatInputIconButtonVariant = 'primary' | 'subtle'

const variantClasses: Record<ChatInputIconButtonVariant, string> = {
  primary: 'bg-primary',
  subtle: 'bg-surface-container-low active:bg-surface-container-high',
}

type ChatInputIconButtonProps = {
  label: string
  onPress?: () => void
  disabled?: boolean
  variant: ChatInputIconButtonVariant
  children: ReactNode
}

export function ChatInputIconButton({
  label,
  onPress,
  disabled = false,
  variant,
  children,
}: ChatInputIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      className={cn(
        'size-8 items-center justify-center rounded-full',
        variantClasses[variant],
        disabled && 'opacity-40',
      )}
    >
      {children}
    </Pressable>
  )
}
