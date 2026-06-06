import { RotateCw } from "lucide-react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useMessagesStore } from "@/pages/chat/stores/messages-store";

type SendRetryFooterProps = {
  className?: string;
};

export function SendRetryFooter({ className }: SendRetryFooterProps) {
  const retrySend = useMessagesStore((store) => store.retrySend);

  return (
    <button
      type="button"
      onClick={() => void retrySend()}
      className={cn(
        "mt-1 inline-flex items-center gap-1.5 pr-2 text-text-error",
        className,
      )}
    >
      <RotateCw className="size-3.5" />
      <Typography variant="label-caps">Ben didn't reply — tap to retry</Typography>
    </button>
  );
}
