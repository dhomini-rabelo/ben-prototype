import { X } from "lucide-react";

type ChatBannerDismissProps = {
  onClick?: () => void;
};

export function ChatBannerDismiss({ onClick }: ChatBannerDismissProps) {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      onClick={onClick}
      className="flex size-6 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
    >
      <X className="size-3.5" />
    </button>
  );
}
