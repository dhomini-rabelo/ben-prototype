import { ChevronUp } from "lucide-react";
import { cn } from "../../../core/cn";
import { Typography } from "./typography";

type ComposerProps = {
  contextLabel?: string;
  className?: string;
  onToggle?: () => void;
};

export function Composer({
  contextLabel = "Context: General",
  className,
  onToggle,
}: ComposerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border border-surface-variant/50 bg-surface-container-lowest px-4 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-primary" />
        <Typography variant="label-caps" className="text-on-surface-variant">
          {contextLabel}
        </Typography>
      </div>
      <button
        aria-label="Collapse context"
        onClick={onToggle}
        className="text-on-surface-variant transition-colors hover:text-primary"
      >
        <ChevronUp className="size-4" />
      </button>
    </div>
  );
}
