import { RotateCw } from "lucide-react";
import { Typography } from "../../../../layout/components/ui/typography";

type TaskPickerErrorProps = {
  onRetry?: () => void;
};

export function TaskPickerError({ onRetry }: TaskPickerErrorProps) {
  return (
    <div className="mx-5 mb-5 flex items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
      <Typography variant="body-md" className="text-text-error">
        couldn't load your tasks
      </Typography>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-full bg-text-error px-3 py-1.5 text-label-caps font-mono uppercase text-on-primary"
      >
        <RotateCw className="size-3" /> retry
      </button>
    </div>
  );
}
