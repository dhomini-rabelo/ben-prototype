import { ChevronRight, Play } from "lucide-react";
import { cn } from "@/layout/utils/styles";
import { useCaptureCard } from "./contexts/capture-card-context";
import type { CaptureCardState } from "./types";

const DEFAULT_TASK_ACTION_LABEL: Record<CaptureCardState, string> = {
  default: "Start",
  pending: "Start",
  active: "Continue",
  finished: "View",
  error: "Start",
  fired: "Start",
};

type CaptureCardActionButtonProps = {
  actionLabel?: string;
  onAction?: () => void;
};

export function CaptureCardActionButton({
  actionLabel,
  onAction,
}: CaptureCardActionButtonProps) {
  const { kind, state } = useCaptureCard();

  if (kind !== "task" || state === "error") {
    return null;
  }

  const isPending = state === "pending";
  const isActive = state === "active";
  const isFinished = state === "finished";
  const resolvedActionLabel = actionLabel ?? DEFAULT_TASK_ACTION_LABEL[state];

  return (
    <button
      type="button"
      onClick={onAction}
      disabled={isPending}
      className={cn(
        "mt-2 inline-flex shrink-0 items-center gap-1 self-end rounded-full px-3 py-1.5 text-label-caps font-semibold uppercase tracking-wider transition-colors",
        isFinished
          ? "bg-transparent text-on-surface-variant hover:text-on-surface"
          : "bg-primary text-on-primary hover:bg-surface-tint",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      {!isFinished && !isActive && (
        <Play className="size-3" strokeWidth={2.5} />
      )}
      {resolvedActionLabel}
      {isFinished && <ChevronRight className="size-3.5" />}
    </button>
  );
}
