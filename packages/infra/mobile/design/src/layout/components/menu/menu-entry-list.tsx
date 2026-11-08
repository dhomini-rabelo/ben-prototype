import { Bell, ListTodo, NotebookPen, Settings } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/layout/utils/styles";
import { Typography } from "@/layout/components/ui/typography";

export type MenuEntryId = "tasks" | "notes" | "reminders" | "settings";

type CountValue = number | "skeleton" | "dash" | undefined;

type MenuEntryListProps = {
  variant?: "default" | "loading" | "error";
  counts?: Partial<Record<MenuEntryId, CountValue>>;
  className?: string;
  onSelect?: (id: MenuEntryId) => void;
};

const ENTRIES: {
  id: MenuEntryId;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  formatCount?: (n: number) => string;
}[] = [
  {
    id: "tasks",
    label: "Tasks",
    icon: ListTodo,
    formatCount: (n) => `${n} active`,
  },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function MenuEntryList({
  variant = "default",
  counts,
  className,
  onSelect,
}: MenuEntryListProps) {
  const effectiveCounts: Partial<Record<MenuEntryId, CountValue>> =
    variant === "loading"
      ? { tasks: "skeleton", notes: "skeleton", reminders: "skeleton" }
      : variant === "error"
        ? { tasks: "dash", notes: "dash", reminders: "dash" }
        : (counts ?? {});

  return (
    <nav className={cn("flex flex-col px-2 pb-2 pt-1", className)}>
      {ENTRIES.map(({ id, label, icon: Icon, formatCount }) => {
        const value = effectiveCounts[id];
        const showCount = id !== "settings";
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect?.(id)}
            className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-left hover:bg-surface-container-low"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
            <Typography
              variant="body-md"
              className="flex-1 font-semibold text-on-surface"
            >
              {label}
            </Typography>
            {showCount && (
              <CountBadge
                entryId={id}
                value={value}
                formatCount={formatCount}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function CountBadge({
  entryId,
  value,
  formatCount,
}: {
  entryId: MenuEntryId;
  value: CountValue;
  formatCount?: (n: number) => string;
}) {
  if (value === undefined) return null;
  if (value === "skeleton") {
    return (
      <span className="h-4 w-12 animate-pulse rounded-full bg-outline-variant/40" />
    );
  }
  if (value === "dash") {
    return (
      <Typography
        variant="label-caps"
        className="normal-case text-on-surface-variant/60"
      >
        —
      </Typography>
    );
  }
  const text =
    entryId === "tasks" && formatCount ? formatCount(value) : `${value}`;
  return (
    <Typography
      variant="label-caps"
      className="normal-case text-on-surface-variant"
    >
      {text}
    </Typography>
  );
}
