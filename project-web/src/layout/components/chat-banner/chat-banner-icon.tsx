import type { ComponentType } from "react";
import { cn } from "@/layout/utils/styles";
import { useChatBannerTone } from "./contexts/tone";

type ChatBannerIconProps = {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

export function ChatBannerIcon({ icon: Icon }: ChatBannerIconProps) {
  const tone = useChatBannerTone();

  return (
    <Icon
      className={cn(
        "size-4 shrink-0",
        tone === "error" ? "text-text-error" : "text-on-surface-variant",
      )}
      strokeWidth={1.75}
    />
  );
}
