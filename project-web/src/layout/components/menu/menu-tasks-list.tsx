import type { TaskListItem } from "@/api/responses/task";
import { Typography } from "@/layout/components/ui/typography";
import { relativeTime } from "@/layout/utils/format-time";
import { MenuListRow } from "./menu-list-row";

type MenuTasksListProps = {
  tasks: TaskListItem[];
};

function taskKind(task: TaskListItem) {
  return task.contentType === "todo" ? "task-list" : "task-text";
}

export function MenuTasksList({ tasks }: MenuTasksListProps) {
  const active = tasks.filter((task) => task.status !== "finished");
  const finished = tasks.filter((task) => task.status === "finished");

  return (
    <section className="flex flex-col gap-2">
      {active.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="px-3 pt-2 text-on-surface-variant"
          >
            Active
          </Typography>
          <div className="flex flex-col">
            {active.map((task) => (
              <MenuListRow
                key={task.id}
                kind={taskKind(task)}
                title={task.title}
                supporting={`active · ${relativeTime(task.lastActivityAt)}`}
              />
            ))}
          </div>
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
          <div className="flex flex-col">
            {finished.map((task) => (
              <MenuListRow
                key={task.id}
                kind={taskKind(task)}
                title={task.title}
                supporting={`finished ${relativeTime(task.lastActivityAt)}`}
                muted
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
