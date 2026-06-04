import type { ReactNode } from "react";
import { cn } from "../../utils/styles";
import { ChatInputContext } from "./contexts/chat-input";

type ChatInputRootProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export function ChatInputRoot({
  draft,
  onDraftChange,
  onSend,
  disabled = false,
  children,
  className,
}: ChatInputRootProps) {
  return (
    <ChatInputContext.Provider value={{ draft, onDraftChange, onSend, disabled }}>
      <div
        className={cn(
          "flex w-full items-center rounded-full border border-transparent bg-surface-container-high px-2 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-colors",
          !disabled &&
            "focus-within:border-outline-variant focus-within:bg-surface-container-highest",
          disabled && "opacity-60",
          className,
        )}
      >
        {children}
      </div>
    </ChatInputContext.Provider>
  );
}
