import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ROUTES } from '@/core/routes'
import { useTaskListData } from '@/layout/hooks/api/use-task-list-data'
import { ActiveTaskPeek } from '@/pages/chat/components/active-task-peek'
import { TaskPickerEmpty } from './task-picker-empty'
import { TaskPickerError } from './task-picker-error'
import { TaskPickerList } from './task-picker-list'
import { TaskPickerSheet } from './task-picker-sheet'
import { TaskPickerSkeleton } from './task-picker-skeleton'

export function ActiveTaskPicker() {
  const [isOpen, setIsOpen] = useState(false)
  const { actions, state } = useTaskListData({ status: 'active' })
  const router = useRouter()

  const tasks = state.data?.items ?? []

  if (!isOpen && (state.isLoading || tasks.length === 0)) {
    return null
  }

  return (
    <>
      <ActiveTaskPeek
        variant="summary"
        count={tasks.length}
        title={tasks[0]?.title}
        onOpen={() => setIsOpen(true)}
      />

      <TaskPickerSheet
        isOpen={isOpen}
        count={tasks.length}
        onClose={() => setIsOpen(false)}
      >
        {state.isLoading ? (
          <TaskPickerSkeleton />
        ) : state.isError ? (
          <TaskPickerError onRetry={() => actions.refetch()} />
        ) : tasks.length === 0 ? (
          <TaskPickerEmpty />
        ) : (
          <TaskPickerList
            tasks={tasks}
            onSelect={(taskId) => {
              setIsOpen(false)
              router.push(ROUTES.taskWorkspace(taskId))
            }}
          />
        )}
      </TaskPickerSheet>
    </>
  )
}
