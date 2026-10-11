import type { TaskListItem } from '@/api/responses/task'
import { MenuListRow } from '@/layout/components/menu-list/menu-list-row'
import { Typography } from '@/layout/components/ui/typography'
import { relativeTime } from '@/layout/utils/format-time'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { menuStrings } from '@/layout/strings/menu-strings'
import { View } from 'react-native'

type MenuTasksListProps = {
  tasks: TaskListItem[]
  onSelect: (taskId: string) => void
}

function taskKind(task: TaskListItem) {
  return task.contentType === 'todo' ? 'task-list' : 'task-text'
}

export function MenuTasksList({ tasks, onSelect }: MenuTasksListProps) {
  const language = useLanguage()
  const strings = useStrings(menuStrings)
  const active = tasks.filter((task) => task.status !== 'finished')
  const finished = tasks.filter((task) => task.status === 'finished')

  return (
    <View className="flex flex-col gap-2">
      {active.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="px-3 pt-2 text-on-surface-variant"
          >
            {strings.activeHeading}
          </Typography>
          <View className="flex flex-col">
            {active.map((task) => (
              <MenuListRow
                key={task.id}
                kind={taskKind(task)}
                title={task.title}
                supporting={strings.activeSupporting(
                  relativeTime(task.lastActivityAt, language),
                )}
                onPress={() => onSelect(task.id)}
              />
            ))}
          </View>
        </>
      )}

      {finished.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="mt-4 px-3 text-on-surface-variant"
          >
            {strings.finishedHeading}
          </Typography>
          <View className="flex flex-col">
            {finished.map((task) => (
              <MenuListRow
                key={task.id}
                kind={taskKind(task)}
                title={task.title}
                supporting={strings.finishedSupporting(
                  relativeTime(task.lastActivityAt, language),
                )}
                muted
                onPress={() => onSelect(task.id)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  )
}
