import { Bell, ListTodo, NotebookPen, Settings, X } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BrandMark } from '@/layout/components/brand-mark'
import { IconButton } from '@/layout/components/ui/icon-button'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import type { MenuEntryId } from '@/layout/stores/menu-store'
import { menuStrings } from '@/layout/strings/menu-strings'
import { onSurface, onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { CountBadge, type CountValue } from './menu-sidebar-count-badge'

type IconProps = { size?: number; color?: string; strokeWidth?: number }

type MenuSidebarProps = {
  variant?: 'default' | 'loading' | 'error'
  counts?: Partial<Record<MenuEntryId, CountValue>>
  className?: string
  onSelect?: (id: MenuEntryId) => void
  onClose?: () => void
}

const ENTRY_ICONS: { id: MenuEntryId; icon: ComponentType<IconProps> }[] = [
  { id: 'tasks', icon: ListTodo },
  { id: 'notes', icon: NotebookPen },
  { id: 'reminders', icon: Bell },
  { id: 'settings', icon: Settings },
]

export function MenuSidebar({
  variant = 'default',
  counts,
  className,
  onSelect,
  onClose,
}: MenuSidebarProps) {
  const insets = useSafeAreaInsets()
  const strings = useStrings(menuStrings)
  const entries = ENTRY_ICONS.map(({ id, icon }) => ({
    id,
    icon,
    label: strings[id],
    formatCount: id === 'tasks' ? strings.activeCount : undefined,
  }))

  const effectiveCounts: Partial<Record<MenuEntryId, CountValue>> =
    variant === 'loading'
      ? { tasks: 'skeleton', notes: 'skeleton', reminders: 'skeleton' }
      : variant === 'error'
        ? { tasks: 'dash', notes: 'dash', reminders: 'dash' }
        : (counts ?? {})

  return (
    <View
      style={{ paddingTop: insets.top }}
      className={cn(
        'h-full w-full bg-surface-container-lowest shadow-[8px_0_32px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      <View className="h-16 flex-row items-center justify-between px-3">
        <View className="pl-2">
          <BrandMark />
        </View>
        {onClose && (
          <IconButton label={strings.closeMenu} onPress={onClose}>
            <X size={24} color={onSurface} />
          </IconButton>
        )}
      </View>

      <View className="px-2 pt-2">
        {entries.map(({ id, label, icon: Icon, formatCount }) => {
          const value = effectiveCounts[id]
          const showCount = id !== 'settings'
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              onPress={() => onSelect?.(id)}
              className={cn(
                'flex-row items-center gap-3 rounded-xl px-3 py-3.5',
                'active:bg-surface-container-low',
              )}
            >
              <View className="size-9 items-center justify-center rounded-lg bg-surface-container-high">
                <Icon size={16} strokeWidth={1.75} color={onSurfaceVariant} />
              </View>
              <Typography
                variant="body-md"
                className="flex-1 font-semibold text-on-surface"
              >
                {label}
              </Typography>
              {showCount && (
                <CountBadge
                  entryId={id}
                  value={value}
                  formatCount={formatCount}
                />
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
