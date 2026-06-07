import { Check } from "lucide-react";
import { memo } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import type { TodoItemDiff } from "@/api/models/task";

type TodoListItemProps = {
  title: string;
  done?: boolean;
  diff?: TodoItemDiff;
  finished?: boolean;
  onToggle?: () => void;
};

function TodoListItemComponent({
  title,
  done,
  diff,
  finished,
  onToggle,
}: TodoListItemProps) {
  const isAdded = diff === "added";
  const isRemoved = diff === "removed";
  const isDiff = isAdded || isRemoved;
  const isMuted = done || finished;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-2.5",
        isAdded && "bg-diff-added ring-1 ring-diff-added-outline/60",
        isRemoved && "bg-diff-removed/60",
      )}
    >
      <button
        type="button"
        aria-label={done ? "Mark not done" : "Mark done"}
        onClick={onToggle}
        disabled={isDiff}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          done
            ? "border-on-surface-variant bg-on-surface-variant text-on-primary"
            : "border-outline-variant bg-surface-container-lowest hover:border-on-surface-variant",
          isDiff && "pointer-events-none",
        )}
      >
        {done && <Check className="size-3.5" strokeWidth={3} />}
      </button>
      <Typography
        variant="body-md"
        className={cn(
          "flex-1 leading-snug",
          isMuted && "text-on-surface-variant line-through",
          isRemoved && "text-diff-removed-fg line-through",
          isAdded && "text-diff-added-fg",
          !done && !isRemoved && !isAdded && "text-on-surface",
        )}
      >
        {title}
      </Typography>
    </div>
  );
}

export const TodoListItem = memo(TodoListItemComponent);
