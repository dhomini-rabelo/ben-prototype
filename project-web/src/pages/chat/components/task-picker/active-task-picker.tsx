import { useState } from "react";
import { useNavigate } from "react-router";
import type { TaskListItem } from "../../../../api/models/task";
import { API_ROUTES } from "../../../../api/routes";
import { buildTaskWorkspacePath } from "../../../../core/routes";
import { useAPIRequest } from "../../../../layout/hooks/use-api-request";
import { ActiveTaskPeek } from "../active-task-peek";
import { TaskPickerSheet } from "./task-picker-sheet";

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `active · ${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `active · ${hours}h ago`;
  }
  return `active · ${Math.floor(hours / 24)}d ago`;
}

export function ActiveTaskPicker() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { actions, state } = useAPIRequest<{ items: TaskListItem[] }>({
    url: API_ROUTES.tasks.list,
    params: { status: "active" },
  });

  const tasks = state.data?.items ?? [];

  if (!isOpen && (state.isLoading || tasks.length === 0)) {
    return null;
  }

  const variant = state.isLoading
    ? "loading"
    : state.isError
      ? "error"
      : tasks.length > 0
        ? "populated"
        : "empty";

  function handleSelect(taskId: string) {
    navigate(buildTaskWorkspacePath(taskId));
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
            <TaskPickerSheet
              variant={variant}
              tasks={tasks.map((task) => ({
                id: task.id,
                title: task.title,
                contentType: task.contentType,
                supporting: relativeTime(task.lastActivityAt),
              }))}
              onSelect={handleSelect}
              onRetry={() => actions.refetch()}
            />
          </div>
        </>
      )}
    </>
  );
}
