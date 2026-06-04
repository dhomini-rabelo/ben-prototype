import type { ReactNode } from "react";
import { cn } from "../../utils/styles";
import { ChatInputDisabledContext } from "./contexts/disabled";

type ChatInputRootProps = {
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export function ChatInputRoot({
  disabled = false,
  children,
  className,
}: ChatInputRootProps) {
  return (
    <ChatInputDisabledContext.Provider value={disabled}>
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
    </ChatInputDisabledContext.Provider>
  );
}
