import { useState } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "@/core/routes";
import { useTaskListData } from "@/layout/hooks/api/use-task-list-data";
import { ActiveTaskPeek } from "@/pages/chat/components/active-task-peek";
import { TaskPickerEmpty } from "./task-picker-empty";
import { TaskPickerError } from "./task-picker-error";
import { TaskPickerList } from "./task-picker-list";
import { TaskPickerSheet } from "./task-picker-sheet";
import { TaskPickerSkeleton } from "./task-picker-skeleton";

export function ActiveTaskPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const { actions, state } = useTaskListData({ status: "active" });

  const navigate = useNavigate();

  const tasks = state.data?.items ?? [];

  if (!isOpen && (state.isLoading || tasks.length === 0)) {
    return null;
  }

  return (
    <>
      <ActiveTaskPeek
        variant="summary"
        count={tasks.length}
        title={tasks[0]?.title}
        onOpen={() => setIsOpen(true)}
      />

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-inverse-surface/30 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-120 -translate-x-1/2">
            <TaskPickerSheet count={tasks.length}>
              {state.isLoading ? (
                <TaskPickerSkeleton />
              ) : state.isError ? (
                <TaskPickerError onRetry={() => actions.refetch()} />
              ) : tasks.length === 0 ? (
                <TaskPickerEmpty />
              ) : (
                <TaskPickerList
                  tasks={tasks}
                  onSelect={(taskId) => navigate(ROUTES.taskWorkspace(taskId))}
                />
              )}
            </TaskPickerSheet>
          </div>
        </>
      )}
    </>
  );
}
