import type { ComponentType } from 'react'
import { Pressable } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant } from '@/layout/utils/colors'

type MessageActionsMenuItemProps = {
  label: string
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
  onPress: () => void
}

export function MessageActionsMenuItem({
  label,
  icon: Icon,
  onPress,
}: MessageActionsMenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-12 flex-row items-center gap-3 rounded-xl px-3 active:bg-surface-container-low"
      onPress={onPress}
    >
      <Icon size={18} strokeWidth={1.75} color={onSurfaceVariant} />
      <Typography variant="body-md" className="text-on-surface">
        {label}
      </Typography>
    </Pressable>
  )
}
