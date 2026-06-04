import { Plus } from "lucide-react";
import { useChatInputDisabled } from "./contexts/disabled";

type ChatInputAttachButtonProps = {
  onClick?: () => void;
};

export function ChatInputAttachButton({ onClick }: ChatInputAttachButtonProps) {
  const disabled = useChatInputDisabled();

  return (
    <button
      type="button"
      aria-label="Attach"
      onClick={onClick}
      disabled={disabled}
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary disabled:hover:text-on-surface-variant"
    >
      <Plus className="size-5" />
    </button>
  );
}
