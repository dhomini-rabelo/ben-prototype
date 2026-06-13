import { Bell, NotebookPen, X } from 'lucide-react-native'
import type { ComponentType, ReactNode } from 'react'
import { View } from 'react-native'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { IconButton } from '@/layout/components/ui/icon-button'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant } from '@/layout/utils/colors'

type ItemKind = 'note' | 'reminder'

type ItemDetailRootProps = {
  kind: ItemKind
  children: ReactNode
  onClose?: () => void
  className?: string
}

const KIND_META: Record<
  ItemKind,
  { label: string; icon: ComponentType<{ size?: number; color?: string }> }
> = {
  note: { label: 'Note', icon: NotebookPen },
  reminder: { label: 'Reminder', icon: Bell },
}

export function ItemDetailRoot({
  kind,
  children,
  onClose,
  className,
}: ItemDetailRootProps) {
  const { label, icon: Icon } = KIND_META[kind]

  return (
    <MenuSheet className={className}>
      <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
        <View className="flex-row items-center gap-2">
          <View className="size-7 items-center justify-center rounded-lg bg-surface-container-high">
            <Icon size={16} color={onSurfaceVariant} />
          </View>
          <Typography variant="label-caps" className="text-on-surface-variant">
            {label}
          </Typography>
        </View>
        <IconButton label="Close" onPress={onClose} className="size-8">
          <X size={16} color={onSurfaceVariant} />
        </IconButton>
      </View>
      {children}
    </MenuSheet>
  )
}
