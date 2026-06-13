import { Bell, List, NotebookPen, Type } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'

export type MenuListRowKind = 'task-text' | 'task-list' | 'note' | 'reminder'

type IconProps = { size?: number; color?: string; strokeWidth?: number }

type MenuListRowProps = {
  kind: MenuListRowKind
  title: string
  supporting?: string
  trailing?: string
  bodyPreview?: string
  muted?: boolean
  emphasizeTrailing?: boolean
  className?: string
  onPress?: () => void
}

const KIND_ICON: Record<MenuListRowKind, ComponentType<IconProps>> = {
  'task-text': Type,
  'task-list': List,
  note: NotebookPen,
  reminder: Bell,
}

export function MenuListRow({
  kind,
  title,
  supporting,
  trailing,
  bodyPreview,
  muted,
  emphasizeTrailing,
  className,
  onPress,
}: MenuListRowProps) {
  const Icon = KIND_ICON[kind]

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        'w-full flex-row items-start gap-3 rounded-xl px-3 py-3',
        'active:bg-surface-container-low',
        className,
      )}
    >
      <View
        className={cn(
          'mt-0.5 size-9 items-center justify-center rounded-lg bg-surface-container-high',
          muted && 'opacity-60',
        )}
      >
        <Icon size={16} strokeWidth={1.75} color={onSurfaceVariant} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-baseline gap-2">
          <Typography
            variant="body-md"
            numberOfLines={1}
            className={cn(
              'flex-1 font-semibold',
              muted ? 'text-on-surface-variant' : 'text-on-surface',
            )}
          >
            {title}
          </Typography>
          {trailing ? (
            <Typography
              variant="label-caps"
              className={cn(
                'shrink-0 normal-case',
                emphasizeTrailing
                  ? 'font-semibold text-on-surface'
                  : 'text-on-surface-variant/70',
                muted && 'text-on-surface-variant/70',
              )}
            >
              {trailing}
            </Typography>
          ) : null}
        </View>
        {bodyPreview ? (
          <Typography
            variant="body-md"
            numberOfLines={1}
            className={cn(
              'text-on-surface-variant',
              muted && 'text-on-surface-variant/70',
            )}
          >
            {bodyPreview}
          </Typography>
        ) : null}
        {supporting ? (
          <Typography
            variant="label-caps"
            className={cn(
              'normal-case',
              muted ? 'text-on-surface-variant/60' : 'text-on-surface-variant',
            )}
          >
            {supporting}
          </Typography>
        ) : null}
      </View>
    </Pressable>
  )
}
