import { ChevronUp, Clock } from "lucide-react";
import { cn } from "../../../core/cn";
import { Typography } from "./typography";

type LedgerPeekProps = {
  variant?: "empty" | "up-next" | "summary" | "skeleton";
  title?: string;
  meta?: string;
  className?: string;
  onExpand?: () => void;
};

export function LedgerPeek({
  variant = "empty",
  title,
  meta,
  className,
  onExpand,
}: LedgerPeekProps) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5 text-left transition-colors hover:bg-surface-container-low",
        className,
      )}
    >
      {variant === "skeleton" ? (
        <div className="h-4 w-40 animate-pulse rounded bg-outline-variant" />
      ) : variant === "empty" ? (
        <Typography variant="body-md" className="text-on-surface-variant">
          nothing on deck — Ben's listening
        </Typography>
      ) : variant === "up-next" ? (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
            <Clock className="size-4" strokeWidth={1.75} />
          </span>
          <div className="flex min-w-0 flex-col">
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              Up next
            </Typography>
            <Typography
              variant="body-md"
              className="truncate text-on-surface"
            >
              {title}
              {meta && (
                <span className="text-on-surface-variant"> · {meta}</span>
              )}
            </Typography>
          </div>
        </div>
      ) : (
        <Typography variant="body-md" className="text-on-surface">
          {title ?? "12 notes · 4 tasks · 0 reminders"}
        </Typography>
      )}
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-transform group-hover:-translate-y-0.5 group-hover:text-primary">
        <ChevronUp className="size-4" strokeWidth={1.75} />
      </div>
    </button>
  );
}
