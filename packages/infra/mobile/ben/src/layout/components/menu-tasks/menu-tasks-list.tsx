import type { TaskListItem } from '@/api/responses/task'
import { MenuListRow } from '@/layout/components/menu-list/menu-list-row'
import { Typography } from '@/layout/components/ui/typography'
import { relativeTime } from '@/layout/utils/format-time'
import { View } from 'react-native'

type MenuTasksListProps = {
  tasks: TaskListItem[]
  onSelect: (taskId: string) => void
}

function taskKind(task: TaskListItem) {
  return task.contentType === 'todo' ? 'task-list' : 'task-text'
}

export function MenuTasksList({ tasks, onSelect }: MenuTasksListProps) {
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
            Active
          </Typography>
          <View className="flex flex-col">
            {active.map((task) => (
              <MenuListRow
                key={task.id}
                kind={taskKind(task)}
                title={task.title}
                supporting={`active · ${relativeTime(task.lastActivityAt)}`}
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
            Finished
          </Typography>
          <View className="flex flex-col">
            {finished.map((task) => (
              <MenuListRow
                key={task.id}
                kind={taskKind(task)}
                title={task.title}
                supporting={`finished ${relativeTime(task.lastActivityAt)}`}
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
