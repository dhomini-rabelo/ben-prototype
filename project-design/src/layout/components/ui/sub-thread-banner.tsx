import { ChevronUp, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Typography } from "./typography";

type SubThreadBannerProps = {
  variant?: "ben-reply" | "user-pending" | "ben-typing" | "error";
  text?: ReactNode;
  meta?: string;
  className?: string;
  onExpand?: () => void;
  onRetry?: () => void;
};

export function SubThreadBanner({
  variant = "ben-reply",
  text,
  meta = "Ben",
  className,
  onExpand,
  onRetry,
}: SubThreadBannerProps) {
  const isError = variant === "error";

  return (
    <button
      type="button"
      onClick={onExpand}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition-colors",
        isError
          ? "border-text-error/30 bg-surface-error"
          : "border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low",
        className,
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
          isError
            ? "bg-text-error/10 text-text-error"
            : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        {variant === "user-pending"
          ? "You"
          : variant === "ben-typing"
            ? "Ben"
            : meta}
      </span>
      <div className="min-w-0 flex-1">
        {variant === "ben-typing" ? (
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant" />
          </span>
        ) : (
          <Typography
            variant="body-md"
            className={cn(
              "truncate text-[14px]",
              variant === "user-pending" && "italic text-on-surface-variant",
              isError && "text-text-error",
              variant === "ben-reply" && "text-on-surface",
            )}
          >
            {text}
          </Typography>
        )}
      </div>
      {isError ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRetry?.();
          }}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-label-caps font-mono uppercase text-text-error"
        >
          <RotateCw className="size-3" /> retry
        </span>
      ) : (
        <ChevronUp className="size-4 shrink-0 text-on-surface-variant transition-transform group-hover:-translate-y-0.5" />
      )}
    </button>
  );
}
