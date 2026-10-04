import type { ReactNode } from "react";
import { cn } from "@/layout/utils/cn";

type MessageBubbleProps = {
  from: "user" | "ben";
  state?: "default" | "pending" | "error" | "skeleton";
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function MessageBubble({
  from,
  state = "default",
  children,
  footer,
  className,
}: MessageBubbleProps) {
  const isBen = from === "ben";

  return (
    <div
      className={cn(
        "flex w-full",
        isBen ? "justify-start" : "justify-end",
        className,
      )}
    >
      <div
        className={cn(
          "flex max-w-[78%] flex-col gap-1",
          isBen ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-body-md",
            isBen
              ? "rounded-tl-sm bg-surface-container-low text-on-surface"
              : "rounded-tr-sm bg-primary text-on-primary",
            state === "pending" && "opacity-60",
            state === "error" &&
              "border border-text-error/30 bg-surface-error text-text-error",
            state === "skeleton" && "h-9 w-40 animate-pulse bg-outline-variant",
          )}
        >
          {state !== "skeleton" && children}
        </div>
        {footer}
      </div>
    </div>
  );
}
