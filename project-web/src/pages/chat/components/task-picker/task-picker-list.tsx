import { List, Type } from "lucide-react";
import type { ComponentType } from "react";
import type { TaskContentType } from "@/api/models/task";
import type { TaskListItem } from "@/api/responses/task";
import { Typography } from "@/layout/components/ui/typography";

type TaskPickerListProps = {
  tasks: TaskListItem[];
  onSelect: (id: string) => void;
};

const SHAPE_ICON: Record<
  TaskContentType,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  text: Type,
  todo: List,
};

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

export function TaskPickerList({ tasks, onSelect }: TaskPickerListProps) {
  return (
    <div className="flex max-h-[420px] flex-col overflow-y-auto px-2 pb-2">
      {tasks.map((task) => {
        const Icon = SHAPE_ICON[task.contentType];
        return (
          <button
            key={task.id}
            type="button"
            onClick={() => onSelect(task.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <Typography variant="body-md" className="truncate text-on-surface">
                {task.title}
              </Typography>
              <Typography
                variant="label-caps"
                className="normal-case text-on-surface-variant"
              >
                {relativeTime(task.lastActivityAt)}
              </Typography>
            </div>
          </button>
        );
      })}
    </div>
  );
}
