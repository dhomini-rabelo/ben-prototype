import { ChevronLeft, List, MoreHorizontal, Type } from "lucide-react";
import { cn } from "@/layout/utils/cn";
import { Typography } from "./ui/typography";

type WorkspaceTopBarProps = {
  title: string;
  contentType?: "text" | "list";
  finishedIndicator?: boolean;
  className?: string;
  onBack?: () => void;
  onOverflow?: () => void;
};

export function WorkspaceTopBar({
  title,
  contentType = "text",
  finishedIndicator,
  className,
  onBack,
  onOverflow,
}: WorkspaceTopBarProps) {
  const TypeIcon = contentType === "list" ? List : Type;

  return (
    <div
      className={cn(
        "flex h-14 items-center justify-between gap-2 px-2",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Back to chat"
        onClick={onBack}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
      >
        <ChevronLeft className="size-5" strokeWidth={2} />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant">
          <TypeIcon className="size-3.5" strokeWidth={1.75} />
        </span>
        <Typography
          variant="body-md"
          className="truncate font-semibold text-on-surface"
        >
          {title}
        </Typography>
        {finishedIndicator && (
          <span className="rounded-full bg-surface-container-high px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            finished
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label="More"
        onClick={onOverflow}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
      >
        <MoreHorizontal className="size-5" strokeWidth={2} />
      </button>
    </div>
  );
}
