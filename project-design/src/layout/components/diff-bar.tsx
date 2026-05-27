import { Check, RotateCw, X } from "lucide-react";
import { cn } from "../utils/cn";
import { Typography } from "./ui/typography";

type DiffBarProps = {
  summary?: string;
  state?: "default" | "error";
  className?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onRetry?: () => void;
};

export function DiffBar({
  summary = "Ben suggested 3 changes",
  state = "default",
  className,
  onApprove,
  onReject,
  onRetry,
}: DiffBarProps) {
  if (state === "error") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-2xl border border-text-error/30 bg-surface-error px-3 py-2.5",
          className,
        )}
      >
        <Typography variant="body-md" className="text-text-error">
          couldn't save — pending kept
        </Typography>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-full bg-text-error px-3 py-1.5 text-label-caps font-semibold uppercase tracking-wider text-on-primary"
        >
          <RotateCw className="size-3" /> retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-diff-added-outline/70 bg-diff-added px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className,
      )}
    >
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
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-2 text-button font-semibold text-on-surface ring-1 ring-outline-variant/60 hover:bg-surface-container-low"
        >
          <X className="size-4" strokeWidth={2} />
          Reject
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-button font-semibold text-on-primary hover:bg-surface-tint"
        >
          <Check className="size-4" strokeWidth={2} />
          Approve
        </button>
      </div>
    </div>
  );
}
