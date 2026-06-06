import { MenuListEmpty } from "@/layout/components/menu-list/menu-list-empty";
import { MenuListError } from "@/layout/components/menu-list/menu-list-error";
import { MenuListLoading } from "@/layout/components/menu-list/menu-list-loading";
import { MenuListShell } from "@/layout/components/menu-list/menu-list-shell";
import { useTaskListData } from "@/layout/hooks/api/use-task-list-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuTasksList } from "./menu-tasks-list";

export function MenuTasksView() {
  const { actions, state } = useTaskListData();
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu);
  const tasks = state.data?.items ?? [];

  return (
    <MenuListShell title="Tasks" onBack={goBackToMenu}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message="couldn't load your tasks"
          onRetry={() => actions.refetch()}
        />
      ) : tasks.length === 0 ? (
        <MenuListEmpty
          title="no tasks yet"
          description="talk to Ben — he'll set one up when something needs working on."
        />
      ) : (
        <MenuTasksList tasks={tasks} />
      )}
    </MenuListShell>
  );
}
