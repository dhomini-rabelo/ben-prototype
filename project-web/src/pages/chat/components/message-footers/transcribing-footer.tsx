import { X } from "lucide-react";
import { Typography } from "../../../../layout/components/ui/typography";
import { cn } from "../../../../layout/utils/styles";

type TranscribingFooterProps = {
  onCancel?: () => void;
  className?: string;
};

export function TranscribingFooter({
  onCancel,
  className,
}: TranscribingFooterProps) {
  return (
    <div className={cn("flex items-center gap-1.5 pr-2", className)}>
      <Typography variant="label-caps" className="text-on-surface-variant">
        Hearing you
      </Typography>
      <span className="flex items-center gap-0.5">
        <span className="size-1 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
        <span className="size-1 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
        <span className="size-1 animate-bounce rounded-full bg-on-surface-variant" />
      </span>
      <button
        type="button"
        aria-label="Cancel transcription"
        onClick={onCancel}
        className="ml-1 flex size-4 items-center justify-center rounded-full text-on-surface-variant hover:text-text-error"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
