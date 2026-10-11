import { useRouter } from 'expo-router'
import { ROUTES } from '@/core/routes'
import { MenuListEmpty } from '@/layout/components/menu-list/menu-list-empty'
import { MenuListError } from '@/layout/components/menu-list/menu-list-error'
import { MenuListLoading } from '@/layout/components/menu-list/menu-list-loading'
import { MenuListShell } from '@/layout/components/menu-list/menu-list-shell'
import { useStrings } from '@/layout/hooks/use-strings'
import { useTaskListData } from '@/layout/hooks/api/use-task-list-data'
import { useMenuStore } from '@/layout/stores/menu-store'
import { menuStrings } from '@/layout/strings/menu-strings'
import { MenuTasksList } from './menu-tasks-list'

export function MenuTasksView() {
  const router = useRouter()
  const { actions, state } = useTaskListData()
  const strings = useStrings(menuStrings)
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu)
  const tasks = state.data?.items ?? []

  function handleSelectTask(taskId: string) {
    router.back()
    router.push(ROUTES.taskWorkspace(taskId))
  }

  return (
    <MenuListShell title={strings.tasks} onBack={goBackToMenu}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message={strings.tasksLoadError}
          onRetry={() => actions.refetch()}
        />
      ) : tasks.length === 0 ? (
        <MenuListEmpty
          title={strings.tasksEmptyTitle}
          description={strings.tasksEmptyDescription}
        />
      ) : (
        <MenuTasksList tasks={tasks} onSelect={handleSelectTask} />
      )}
    </MenuListShell>
  )
}
