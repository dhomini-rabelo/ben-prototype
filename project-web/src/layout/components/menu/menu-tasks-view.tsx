import { AlertCircle } from "lucide-react";
import type { TaskListItem } from "@/api/responses/task";
import { ChatBanner } from "@/layout/components/chat-banner";
import { Typography } from "@/layout/components/ui/typography";
import { useTaskListData } from "@/layout/hooks/api/use-task-list-data";
import { relativeTime } from "@/layout/utils/format-time";
import { MenuListRow } from "./menu-list-row";
import { MenuListShell } from "./menu-list-shell";

type MenuTasksViewProps = {
  onBack: () => void;
};

function taskKind(task: TaskListItem) {
  return task.contentType === "todo" ? "task-list" : "task-text";
}

export function MenuTasksView({ onBack }: MenuTasksViewProps) {
  const { actions, state } = useTaskListData();
  const tasks = state.data?.items ?? [];
  const active = tasks.filter((task) => task.status !== "finished");
  const finished = tasks.filter((task) => task.status === "finished");

  return (
    <MenuListShell title="Tasks" onBack={onBack}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <div className="pt-4">
          <ChatBanner.Root tone="error">
            <ChatBanner.Icon icon={AlertCircle} />
            <ChatBanner.Text>couldn't load your tasks</ChatBanner.Text>
            <ChatBanner.Action label="retry" onClick={() => actions.refetch()} />
          </ChatBanner.Root>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Typography variant="body-md" className="text-on-surface">
            no tasks yet
          </Typography>
          <Typography variant="body-md" className="mt-1 text-on-surface-variant">
            talk to Ben — he'll set one up when something needs working on.
          </Typography>
        </div>
      ) : (
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
      )}
    </MenuListShell>
  );
}

export function MenuListLoading() {
  return (
    <div className="flex flex-col gap-1 pt-2">
      {[0, 1, 2, 3, 4].map((index) => (
        <div key={index} className="flex items-start gap-3 rounded-xl px-3 py-3">
          <div className="size-9 animate-pulse rounded-lg bg-outline-variant/40" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-outline-variant/40" />
            <div className="h-3 w-full animate-pulse rounded bg-outline-variant/30" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-outline-variant/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
