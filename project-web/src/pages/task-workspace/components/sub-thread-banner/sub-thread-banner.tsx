import { RotateCw } from "lucide-react";
import { memo } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";

type SubThreadBannerProps = {
  variant?: "ben-reply" | "user-pending" | "ben-typing" | "error";
  text?: string;
  onRetry?: () => void;
};

function SubThreadBannerComponent({
  variant = "ben-reply",
  text,
  onRetry,
}: SubThreadBannerProps) {
  const isError = variant === "error";

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2 text-left",
        isError
          ? "border-text-error/30 bg-surface-error"
          : "border-outline-variant/40 bg-surface-container-lowest",
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
        {variant === "user-pending" ? "You" : "Ben"}
      </span>
      <div className="min-w-0 flex-1">
        {variant === "ben-typing" ? (
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant" />
          </span>
        ) : variant === "user-pending" ? (
          <span className="inline-flex items-center gap-1.5">
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              Hearing you
            </Typography>
            <span className="flex items-center gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-on-surface-variant" />
            </span>
          </span>
        ) : (
          <Typography
            variant="body-md"
            className={cn(
              "truncate text-[14px]",
              isError ? "text-text-error" : "text-on-surface",
            )}
          >
            {text}
          </Typography>
        )}
      </div>
      {isError && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1 text-label-caps font-mono uppercase text-text-error"
        >
          <RotateCw className="size-3" /> retry
        </button>
      )}
    </div>
  );
}

export const SubThreadBanner = memo(SubThreadBannerComponent);
