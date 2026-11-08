import { ArrowUp, List, Mic, Plus } from "lucide-react";
import type { ChangeEvent, ComponentType } from "react";
import { cn } from "@/layout/utils/styles";

type ChatInputLeading = "menu" | "attach";

type ChatInputProps = {
  value?: string;
  placeholder?: string;
  mode?: "idle" | "composing" | "disabled" | "sending-disabled";
  leading?: ChatInputLeading;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const LEADING_BUTTONS: Record<
  ChatInputLeading,
  { icon: ComponentType<{ className?: string }>; label: string }
> = {
  menu: { icon: List, label: "Menu" },
  attach: { icon: Plus, label: "Attach" },
};

export function ChatInput({
  value = "",
  placeholder = "Message Ben...",
  mode = "idle",
  leading = "menu",
  onChange,
  className,
}: ChatInputProps) {
  const hasText = mode === "composing" || value.length > 0;
  const disabled = mode === "disabled";
  const { icon: LeadingIcon, label: leadingLabel } = LEADING_BUTTONS[leading];

  return (
    <div
      className={cn(
        "flex min-h-[44px] w-full items-end gap-1 rounded-[22px] border-[1.5px] border-field-border bg-surface-container-lowest px-1.5 py-[3px] shadow-[0_3px_10px_rgba(29,24,20,0.05)]",
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        aria-label={leadingLabel}
        disabled={disabled}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface"
      >
        <LeadingIcon className="size-4" />
      </button>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-[15px] leading-5 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
      />
      <button
        type="button"
        aria-label={hasText ? "Send" : "Voice input"}
        disabled={disabled || mode === "sending-disabled"}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-60"
      >
        {hasText ? <ArrowUp className="size-4" /> : <Mic className="size-4" />}
      </button>
    </div>
  );
}
