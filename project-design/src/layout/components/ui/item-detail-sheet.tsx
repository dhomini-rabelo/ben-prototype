import { Bell, NotebookPen, RotateCw, X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "../../../core/cn";
import { Typography } from "./typography";

type ItemKind = "note" | "reminder";

type ItemDetailSheetProps = {
  kind?: ItemKind;
  title?: string;
  body?: ReactNode;
  capturedAtAbsolute?: string;
  capturedAtRelative?: string;
  firesAtAbsolute?: string;
  firesAtRelative?: string;
  status?: "upcoming" | "fired";
  variant?: "populated" | "loading" | "error" | "gone";
  errorMessage?: string;
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
};

const KIND_META: Record<
  ItemKind,
  { label: string; icon: ComponentType<{ className?: string; strokeWidth?: number }> }
> = {
  note: { label: "Note", icon: NotebookPen },
  reminder: { label: "Reminder", icon: Bell },
};

export function ItemDetailSheet({
  kind = "note",
  title,
  body,
  capturedAtAbsolute,
  capturedAtRelative,
  firesAtAbsolute,
  firesAtRelative,
  status,
  variant = "populated",
  errorMessage,
  onClose,
  onRetry,
  className,
}: ItemDetailSheetProps) {
  const { label, icon: Icon } = KIND_META[kind];
  const isReminder = kind === "reminder";
  const isFired = status === "fired";

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-t-3xl bg-surface-container-lowest pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <span className="h-1 w-10 rounded-full bg-outline-variant/60" />
      </div>
      <div className="flex items-center justify-between px-5 pt-1 pb-3">
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <Typography
            variant="label-caps"
            className="text-on-surface-variant"
          >
            {label}
          </Typography>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      {variant === "loading" && (
        <div className="flex flex-col gap-3 px-5 pb-5">
          <div className="h-6 w-3/4 animate-pulse rounded bg-outline-variant/50" />
          <div className="h-4 w-full animate-pulse rounded bg-outline-variant/40" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-outline-variant/40" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-outline-variant/30" />
        </div>
      )}

      {variant === "error" && (
        <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
          <div className="flex flex-1 flex-col gap-1">
            <Typography variant="body-md" className="text-text-error">
              {errorMessage ?? "couldn't load this one — tap to retry"}
            </Typography>
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 inline-flex items-center gap-1.5 self-start text-label-caps font-mono uppercase text-text-error"
            >
              <RotateCw className="size-3.5" /> retry
            </button>
          </div>
        </div>
      )}

      {variant === "gone" && (
        <div className="px-5 pb-6">
          <Typography variant="body-md" className="text-on-surface-variant">
            this one's gone — must've been cleared elsewhere.
          </Typography>
        </div>
      )}

      {variant === "populated" && (
        <div className="flex flex-col gap-3 px-5 pb-5">
          {title && (
            <Typography
              variant="headline-lg"
              className="leading-tight text-on-surface"
            >
              {title}
            </Typography>
          )}

          {isReminder && (firesAtRelative || firesAtAbsolute) && (
            <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low px-3.5 py-3">
              <div className="flex items-center gap-2">
                {firesAtRelative && (
                  <Typography
                    variant="body-md"
                    className={cn(
                      "font-semibold",
                      isFired ? "text-on-surface-variant" : "text-on-surface",
                    )}
                  >
                    {firesAtRelative}
                  </Typography>
                )}
                {status && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-px font-mono text-[10px] uppercase tracking-wider",
                      isFired
                        ? "bg-surface-container-high text-on-surface-variant/70"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {status}
                  </span>
                )}
              </div>
              {firesAtAbsolute && (
                <Typography
                  variant="label-caps"
                  className="normal-case text-on-surface-variant"
                >
                  {firesAtAbsolute}
                </Typography>
              )}
            </div>
          )}

          {body && (
            <div className="max-h-72 overflow-y-auto pr-1">
              <Typography
                variant="body-md"
                className="leading-relaxed text-on-surface"
              >
                {body}
              </Typography>
            </div>
          )}

          {(capturedAtAbsolute || capturedAtRelative) && (
            <div className="mt-1 flex flex-col gap-0.5 border-t border-outline-variant/40 pt-3">
              <Typography
                variant="label-caps"
                className="text-on-surface-variant"
              >
                Captured
              </Typography>
              {capturedAtAbsolute && (
                <Typography
                  variant="body-md"
                  className="text-on-surface-variant"
                >
                  {capturedAtAbsolute}
                </Typography>
              )}
              {capturedAtRelative && (
                <Typography
                  variant="label-caps"
                  className="normal-case text-on-surface-variant/70"
                >
                  {capturedAtRelative}
                </Typography>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
