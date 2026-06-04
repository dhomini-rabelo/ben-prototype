import type { KeyboardEvent } from "react";
import { useChatInputDisabled } from "./contexts/disabled";

type ChatInputInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
};

export function ChatInputInput({
  value,
  onChange,
  onSend,
  placeholder = "Message Ben...",
}: ChatInputInputProps) {
  const disabled = useChatInputDisabled();

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
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className="min-w-0 flex-1 border-none bg-transparent px-2 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
    />
  );
}
