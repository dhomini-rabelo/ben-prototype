import { Check, Plus } from "lucide-react";
import { cn } from "../../utils/cn";
import { Typography } from "./typography";

type TodoListItemProps = {
  title: string;
  done?: boolean;
  diff?: "added" | "removed";
  addRow?: boolean;
  className?: string;
  onToggle?: () => void;
};

export function TodoListItem({
  title,
  done,
  diff,
  addRow,
  className,
  onToggle,
}: TodoListItemProps) {
  if (addRow) {
    return (
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-on-surface-variant hover:bg-surface-container-low",
          className,
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-outline-variant">
          <Plus className="size-3" strokeWidth={2} />
        </span>
        <Typography variant="body-md" className="text-on-surface-variant/70">
          add item
        </Typography>
      </button>
    );
  }

  const isAdded = diff === "added";
  const isRemoved = diff === "removed";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-2.5",
        isAdded && "bg-diff-added ring-1 ring-diff-added-outline/60",
        isRemoved && "bg-diff-removed/60",
        className,
      )}
    >
      <button
        type="button"
        aria-label={done ? "Mark not done" : "Mark done"}
        onClick={onToggle}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          done
            ? "border-on-surface-variant bg-on-surface-variant text-on-primary"
            : "border-outline-variant bg-surface-container-lowest hover:border-on-surface-variant",
        )}
      >
        {done && <Check className="size-3.5" strokeWidth={3} />}
      </button>
      <Typography
        variant="body-md"
        className={cn(
          "flex-1 leading-snug",
          done && "text-on-surface-variant line-through",
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
