import type { Icon as PhosphorIcon } from 'phosphor-react-native'
import { Bell, GearSix, ListChecks, NotePencil } from 'phosphor-react-native'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import type { MenuEntryId } from '@/layout/stores/menu-store'
import { menuStrings } from '@/layout/strings/menu-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { CountBadge, type CountValue } from './menu-sidebar-count-badge'

type MenuEntryListProps = {
  variant?: 'default' | 'loading' | 'error'
  counts?: Partial<Record<MenuEntryId, CountValue>>
  className?: string
  onSelect?: (id: MenuEntryId) => void
}

const ENTRY_ICONS: { id: MenuEntryId; icon: PhosphorIcon }[] = [
  { id: 'tasks', icon: ListChecks },
  { id: 'notes', icon: NotePencil },
  { id: 'reminders', icon: Bell },
  { id: 'settings', icon: GearSix },
]

export function MenuEntryList({
  variant = 'default',
  counts,
  className,
  onSelect,
}: MenuEntryListProps) {
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
    <View className={cn('px-2 pb-2 pt-1', className)}>
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
              <Icon size={16} color={onSurfaceVariant} />
            </View>
            <Typography
              variant="body-md"
              className="flex-1 font-sans-semibold text-on-surface"
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
  )
}
