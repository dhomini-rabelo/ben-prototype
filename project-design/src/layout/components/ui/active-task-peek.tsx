import { ChevronUp, Hammer } from "lucide-react";
import { cn } from "../../utils/cn";
import { Typography } from "./typography";

type ActiveTaskPeekProps = {
  variant?: "empty" | "summary" | "skeleton";
  count?: number;
  title?: string;
  className?: string;
  onOpen?: () => void;
};

export function ActiveTaskPeek({
  variant = "empty",
  count,
  title,
  className,
  onOpen,
}: ActiveTaskPeekProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5 text-left transition-colors hover:bg-surface-container-low",
        className,
      )}
    >
      {variant === "skeleton" ? (
        <div className="h-4 w-40 animate-pulse rounded bg-outline-variant" />
      ) : variant === "empty" ? (
        <Typography variant="body-md" className="text-on-surface-variant">
          nothing in progress — Ben's listening
        </Typography>
      ) : (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
            <Hammer className="size-4" strokeWidth={1.75} />
          </span>
          <div className="flex min-w-0 items-center gap-2">
            <Typography
              variant="label-caps"
              className="shrink-0 text-on-surface-variant"
            >
              {count != null ? `${count} active` : "active"}
            </Typography>
            {title && (
              <Typography
                variant="body-md"
                className="truncate text-on-surface"
              >
                · {title}
              </Typography>
            )}
          </div>
        </div>
      )}
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-transform group-hover:-translate-y-0.5 group-hover:text-primary">
        <ChevronUp className="size-4" strokeWidth={1.75} />
      </div>
    </button>
  );
}
