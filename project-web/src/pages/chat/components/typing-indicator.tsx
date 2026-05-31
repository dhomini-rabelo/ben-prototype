import { cn } from "../../../layout/utils/styles";

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-container-low px-4 py-3.5",
        className,
      )}
      aria-label="Ben is typing"
    >
      <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant" />
    </div>
  );
}
