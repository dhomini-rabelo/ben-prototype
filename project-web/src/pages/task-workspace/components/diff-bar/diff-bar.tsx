import { Check, X } from "lucide-react";
import type { Task } from "../../../../api/models/task";
import { Typography } from "../../../../layout/components/ui/typography";
import { useWorkspaceTask } from "../../hooks/use-workspace-task";

type DiffBarProps = {
  disabled?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
};

function diffSummary(task: Task | null): string {
  const changes = task?.pendingDiff?.changes;
  if (!changes) {
    return "";
  }
  if (changes.contentType === "todo") {
    const count = changes.items.filter(
      (item) => item.diff !== "unchanged",
    ).length;
    return `Ben suggested ${count} change${count === 1 ? "" : "s"}`;
  }
  return "Ben revised the draft";
}

export function DiffBar({ disabled, onApprove, onReject }: DiffBarProps) {
  const task = useWorkspaceTask();
  const summary = diffSummary(task);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-diff-added-outline/70 bg-diff-added px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <Typography
        variant="label-caps"
        className="normal-case text-diff-added-fg"
      >
        {summary}
      </Typography>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReject}
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-2 text-button font-semibold text-on-surface ring-1 ring-outline-variant/60 hover:bg-surface-container-low disabled:opacity-60"
        >
          <X className="size-4" strokeWidth={2} />
          Reject
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-button font-semibold text-on-primary hover:bg-surface-tint disabled:opacity-60"
        >
          <Check className="size-4" strokeWidth={2} />
          Approve
        </button>
      </div>
    </div>
  );
}
