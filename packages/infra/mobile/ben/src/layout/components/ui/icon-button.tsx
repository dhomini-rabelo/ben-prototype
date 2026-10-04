import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { cn } from '@/layout/utils/styles'

type IconButtonProps = {
  label: string
  children: ReactNode
  className?: string
  onPress?: () => void
}

export function IconButton({
  label,
  children,
  className,
  onPress,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'size-10 items-center justify-center rounded-full',
        'active:bg-surface-container-high',
        className,
      )}
    >
      {children}
    </Pressable>
  )
}
