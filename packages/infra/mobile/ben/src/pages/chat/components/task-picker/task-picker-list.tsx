import { List, Type } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import type { TaskContentType } from '@/api/models/task'
import type { TaskListItem } from '@/api/responses/task'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'

type TaskPickerListProps = {
  tasks: TaskListItem[]
  onSelect: (id: string) => void
}

const SHAPE_ICON: Record<
  TaskContentType,
  ComponentType<{
    className?: string
    color?: string
    size?: number
    strokeWidth?: number
  }>
> = {
  text: Type,
  todo: List,
}

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) {
    return 'just now'
  }
  if (minutes < 60) {
    return `active · ${minutes}m ago`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `active · ${hours}h ago`
  }
  return `active · ${Math.floor(hours / 24)}d ago`
}

export function TaskPickerList({ tasks, onSelect }: TaskPickerListProps) {
  return (
    <ScrollView
      style={{ maxHeight: 420 }}
      className="px-2 pb-2"
      showsVerticalScrollIndicator={false}
    >
      {tasks.map((task) => {
        const Icon = SHAPE_ICON[task.contentType]
        return (
          <Pressable
            key={task.id}
            accessibilityRole="button"
            onPress={() => onSelect(task.id)}
            className={cn(
              'w-full flex-row items-center gap-3 rounded-xl px-3 py-3',
              'active:bg-surface-container-low',
            )}
          >
            <View className="size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
              <Icon color={onSurfaceVariant} size={16} strokeWidth={1.75} />
            </View>
            <View className="min-w-0 flex-1 flex-col">
              <Typography
                variant="body-md"
                numberOfLines={1}
                className="text-on-surface"
              >
                {task.title}
              </Typography>
              <Typography
                variant="label-caps"
                className="normal-case text-on-surface-variant"
              >
                {relativeTime(task.lastActivityAt)}
              </Typography>
            </View>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
