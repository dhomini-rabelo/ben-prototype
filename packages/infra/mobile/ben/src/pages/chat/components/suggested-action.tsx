import { ArrowRight } from 'lucide-react-native'
import type { ComponentType, ReactNode } from 'react'
import { Pressable, Text } from 'react-native'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'

export type SuggestedActionIcon = ComponentType<{
  className?: string
  color?: string
  size?: number
  strokeWidth?: number
}>

type SuggestedActionProps = {
  icon: SuggestedActionIcon
  children: ReactNode
  className?: string
  onPress?: () => void
}

export function SuggestedAction({
  icon: Icon,
  children,
  className,
  onPress,
}: SuggestedActionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'w-full flex-row items-center gap-4 rounded-lg bg-surface-container-low p-4',
        'active:bg-surface-container-high',
        className,
      )}
    >
      <Icon color={onSurfaceVariant} size={20} strokeWidth={1.75} />
      <Text className="flex-1 text-button font-semibold text-on-surface">
        {children}
      </Text>
      <ArrowRight color={onSurfaceVariant} size={16} strokeWidth={1.75} />
    </Pressable>
  )
}
