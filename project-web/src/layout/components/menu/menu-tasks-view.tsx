import { useTaskListData } from "@/layout/hooks/api/use-task-list-data";
import { MenuListEmpty } from "./menu-list-empty";
import { MenuListError } from "./menu-list-error";
import { MenuListLoading } from "./menu-list-loading";
import { MenuListShell } from "./menu-list-shell";
import { MenuTasksList } from "./menu-tasks-list";

type MenuTasksViewProps = {
  onBack: () => void;
};

export function MenuTasksView({ onBack }: MenuTasksViewProps) {
  const { actions, state } = useTaskListData();
  const tasks = state.data?.items ?? [];

  return (
    <MenuListShell title="Tasks" onBack={onBack}>
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
