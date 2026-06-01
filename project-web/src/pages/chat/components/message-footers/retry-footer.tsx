import { RotateCw } from "lucide-react";
import { Typography } from "../../../../layout/components/ui/typography";
import { cn } from "../../../../layout/utils/styles";

type RetryFooterProps = {
  onRetry?: () => void;
  className?: string;
};

export function RetryFooter({ onRetry, className }: RetryFooterProps) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className={cn(
        "mt-1 inline-flex items-center gap-1.5 pr-2 text-text-error",
        className,
      )}
    >
      <RotateCw className="size-3.5" />
      <Typography variant="label-caps">Tap to retry</Typography>
    </button>
  );
}
