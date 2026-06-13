import { Bell, ListTodo, NotebookPen, Settings } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { Pressable, View } from 'react-native'
import { BrandMark } from '@/layout/components/brand-mark'
import { Typography } from '@/layout/components/ui/typography'
import type { MenuEntryId } from '@/layout/stores/menu-store'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { CountBadge, type CountValue } from './menu-sidebar-count-badge'

type IconProps = { size?: number; color?: string; strokeWidth?: number }

type MenuSidebarProps = {
  variant?: 'default' | 'loading' | 'error'
  counts?: Partial<Record<MenuEntryId, CountValue>>
  className?: string
  onSelect?: (id: MenuEntryId) => void
}

const ENTRIES: {
  id: MenuEntryId
  label: string
  icon: ComponentType<IconProps>
  formatCount?: (n: number) => string
}[] = [
  {
    id: 'tasks',
    label: 'Tasks',
    icon: ListTodo,
    formatCount: (n) => `${n} active`,
  },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function MenuSidebar({
  variant = 'default',
  counts,
  className,
  onSelect,
}: MenuSidebarProps) {
  const effectiveCounts: Partial<Record<MenuEntryId, CountValue>> =
    variant === 'loading'
      ? { tasks: 'skeleton', notes: 'skeleton', reminders: 'skeleton' }
      : variant === 'error'
        ? { tasks: 'dash', notes: 'dash', reminders: 'dash' }
        : (counts ?? {})

  return (
    <View
      className={cn(
        'h-full w-full bg-surface-container-lowest shadow-[8px_0_32px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      <View className="h-16 flex-row items-center px-5">
        <BrandMark logoWidth={24} logoHeight={19} />
      </View>

      <View className="px-2 pt-2">
        {ENTRIES.map(({ id, label, icon: Icon, formatCount }) => {
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
