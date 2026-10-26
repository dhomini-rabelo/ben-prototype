import { List, TextT, type Icon as PhosphorIcon } from 'phosphor-react-native'
import { Pressable, ScrollView, View } from 'react-native'
import type { TaskContentType } from '@/api/models/task'
import type { TaskListItem } from '@/api/responses/task'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'
import type { Language } from '@/core/languages'
import { formatTimeStrings } from '@/layout/strings/format-time-strings'
import { cn } from '@/layout/utils/styles'
import { taskPickerStrings } from '@/pages/chat/strings/task-picker-strings'

type TaskPickerListProps = {
  tasks: TaskListItem[]
  onSelect: (id: string) => void
}

const SHAPE_ICON: Record<TaskContentType, PhosphorIcon> = {
  text: TextT,
  todo: List,
}

function activityLabel(
  iso: string,
  language: Language,
  activeAgo: (relative: string) => string,
): string {
  const time = formatTimeStrings[language]
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) {
    return time.justNow
  }
  if (minutes < 60) {
    return activeAgo(time.minutesAgo(minutes))
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return activeAgo(time.hoursAgo(hours))
  }
  return activeAgo(time.daysAgo(Math.floor(hours / 24)))
}

export function TaskPickerList({ tasks, onSelect }: TaskPickerListProps) {
  const strings = useStrings(taskPickerStrings)
  const language = useLanguage()
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
              <Icon color={onSurfaceVariant} size={16} />
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
                {activityLabel(
                  task.lastActivityAt,
                  language,
                  strings.activeAgo,
                )}
              </Typography>
            </View>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
