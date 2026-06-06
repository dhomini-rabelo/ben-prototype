import { RotateCw } from "lucide-react";
import { Typography } from "@/layout/components/ui/typography";

type ItemDetailErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function ItemDetailError({ message, onRetry }: ItemDetailErrorProps) {
  return (
    <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
      <div className="flex flex-1 flex-col gap-1">
        <Typography variant="body-md" className="text-text-error">
          {message ?? "couldn't load this one — tap to retry"}
        </Typography>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 self-start text-label-caps font-mono uppercase text-text-error"
        >
          <RotateCw className="size-3.5" /> retry
        </button>
      </div>
    </div>
  );
}
