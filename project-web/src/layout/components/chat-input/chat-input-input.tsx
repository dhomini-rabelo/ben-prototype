import type { KeyboardEvent } from "react";
import { useChatInputContext } from "./contexts/chat-input";

type ChatInputInputProps = {
  placeholder?: string;
};

export function ChatInputInput({
  placeholder = "Message Ben...",
}: ChatInputInputProps) {
  const { draft, onDraftChange, onSend, disabled } = useChatInputContext();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !disabled) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={draft}
      onChange={(event) => onDraftChange(event.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className="min-w-0 flex-1 border-none bg-transparent px-2 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
    />
  );
}
