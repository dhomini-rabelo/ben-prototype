import { AlertCircle } from "lucide-react";
import { ChatBanner } from "@/layout/components/chat-banner";

type MenuListErrorProps = {
  message: string;
  onRetry: () => void;
};

export function MenuListError({ message, onRetry }: MenuListErrorProps) {
  return (
    <div className="pt-4">
      <ChatBanner.Root tone="error">
        <ChatBanner.Icon icon={AlertCircle} />
        <ChatBanner.Text>{message}</ChatBanner.Text>
        <ChatBanner.Action label="retry" onClick={onRetry} />
      </ChatBanner.Root>
    </div>
  );
}
