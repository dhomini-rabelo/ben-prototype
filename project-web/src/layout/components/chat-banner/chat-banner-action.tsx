import { cn } from "../../utils/styles";
import { useChatBannerTone } from "./contexts/tone";

type ChatBannerActionProps = {
  label: string;
  onClick?: () => void;
};

export function ChatBannerAction({ label, onClick }: ChatBannerActionProps) {
  const tone = useChatBannerTone();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 text-button font-semibold underline-offset-2 hover:underline",
        tone === "error" ? "text-text-error" : "text-primary",
      )}
    >
      {label}
    </button>
  );
}
