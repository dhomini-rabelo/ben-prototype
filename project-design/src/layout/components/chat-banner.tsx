import { X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "../utils/cn";
import { Typography } from "./ui/typography";

type ChatBannerProps = {
  tone?: "info" | "warn" | "error";
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
  action?: { label: string; onClick?: () => void };
  dismissible?: boolean;
  className?: string;
};

export function ChatBanner({
  tone = "info",
  icon: Icon,
  children,
  action,
  dismissible,
  className,
}: ChatBannerProps) {
  const toneClasses = {
    info: "bg-surface-container-low text-on-surface border-outline-variant/50",
    warn: "bg-surface-container-low text-on-surface border-outline-variant/60",
    error: "bg-surface-error text-text-error border-text-error/20",
  }[tone];

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5",
        toneClasses,
        className,
      )}
      role="status"
    >
      {Icon && (
        <Icon
          className={cn(
            "size-4 shrink-0",
            tone === "error" ? "text-text-error" : "text-on-surface-variant",
          )}
          strokeWidth={1.75}
        />
      )}
      <Typography variant="body-md" className="flex-1 text-[15px] leading-snug">
        {children}
      </Typography>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            "shrink-0 text-button font-semibold underline-offset-2 hover:underline",
            tone === "error" ? "text-text-error" : "text-primary",
          )}
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
