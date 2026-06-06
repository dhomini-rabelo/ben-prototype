import { RotateCw } from "lucide-react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useVoiceStore } from "@/layout/stores/voice-store";

type RetryFooterProps = {
  className?: string;
};

export function RetryFooter({ className }: RetryFooterProps) {
  const retryVoice = useVoiceStore((store) => store.retryVoice);

  return (
    <button
      type="button"
      onClick={retryVoice}
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
