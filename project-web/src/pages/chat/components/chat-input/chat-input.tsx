import { Mic, Plus, Send } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { cn } from "../../../../layout/utils/styles";

type ChatInputProps = {
  value?: string;
  placeholder?: string;
  mode?: "idle" | "composing" | "disabled" | "sending-disabled";
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSend?: () => void;
  onStartRecording?: () => void;
  canRecord?: boolean;
  className?: string;
};

export function ChatInput({
  value = "",
  placeholder = "Message Ben...",
  mode = "idle",
  onChange,
  onSend,
  onStartRecording,
  canRecord = true,
  className,
}: ChatInputProps) {
  const hasText = mode === "composing" || value.length > 0;
  const disabled = mode === "disabled";

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !disabled) {
      event.preventDefault();
      onSend?.();
    }
  }

  return (
    <div
      className={cn(
        "flex w-full items-center rounded-full border border-transparent bg-surface-container-high px-2 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-colors",
        !disabled &&
          "focus-within:border-outline-variant focus-within:bg-surface-container-highest",
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Attach"
        disabled={disabled}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary disabled:hover:text-on-surface-variant"
      >
        <Plus className="size-5" />
      </button>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="min-w-0 flex-1 border-none bg-transparent px-2 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
      />
      {hasText ? (
        <button
          type="button"
          aria-label="Send"
          onClick={onSend}
          disabled={disabled || mode === "sending-disabled"}
          className="ml-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-60"
        >
          <Send className="size-5" strokeWidth={2} />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Voice input"
          onClick={onStartRecording}
          disabled={disabled || mode === "sending-disabled" || !canRecord}
          className="ml-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-60"
        >
          <Mic className="size-5" />
        </button>
      )}
    </div>
  );
}
