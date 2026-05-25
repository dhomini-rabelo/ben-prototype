import { Bell, CheckSquare, NotebookPen, RotateCw, Square } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "../../../core/cn";
import { Typography } from "./typography";

type CaptureKind = "note" | "reminder" | "task";

type CaptureCardProps = {
  kind: CaptureKind;
  title: string;
  meta?: string;
  state?: "default" | "pending" | "error" | "done" | "fired";
  onToggle?: () => void;
  errorMessage?: string;
  className?: string;
};

const KIND_META: Record<
  CaptureKind,
  { label: string; icon: ComponentType<{ className?: string; strokeWidth?: number }> }
> = {
  note: { label: "Note", icon: NotebookPen },
  reminder: { label: "Reminder", icon: Bell },
  task: { label: "Task", icon: CheckSquare },
};

const DEFAULT_ERROR_MESSAGES: Record<CaptureKind, string> = {
  note: "couldn't save this note — retry",
  reminder: "couldn't save this reminder — retry",
  task: "couldn't save this task — retry",
};

export function CaptureCard({
  kind,
  title,
  meta,
  state = "default",
  onToggle,
  errorMessage,
  className,
}: CaptureCardProps) {
  const { label, icon: Icon } = KIND_META[kind];
  const isError = state === "error";
  const isPending = state === "pending";
  const isDone = state === "done";
  const isFired = state === "fired";

  return (
    <div
      className={cn(
        "mt-2 flex items-start gap-3 rounded-xl border bg-surface-container-lowest px-3.5 py-3",
        isError && "border-text-error/30 bg-surface-error",
        isPending && "border-outline-variant/30 opacity-80",
        isDone && "border-outline-variant/40 bg-surface-container-low",
        isFired && "border-outline-variant/40 bg-surface-container-low",
        !isError && !isPending && !isDone && !isFired && "border-outline-variant/50",
        className,
      )}
    >
      {kind === "task" ? (
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
            isError
              ? "bg-surface-error text-text-error"
              : "bg-surface-container-high text-on-surface-variant",
            isPending && "pointer-events-none opacity-60",
          )}
        >
          {isDone ? (
            <CheckSquare className="size-4" strokeWidth={1.75} />
          ) : (
            <Square className="size-4" strokeWidth={1.75} />
          )}
        </button>
      ) : (
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
            isError
              ? "bg-surface-error text-text-error"
              : isFired
                ? "bg-surface-container-high text-on-surface-variant/60"
                : "bg-surface-container-high text-on-surface-variant",
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typography
          variant="label-caps"
          className={isError ? "text-text-error" : "text-on-surface-variant"}
        >
          {label}
          {isFired && (
            <span className="ml-1 font-mono text-[10px] uppercase text-on-surface-variant/60">
              fired
            </span>
          )}
        </Typography>
        <Typography
          variant="body-md"
          className={cn(
            "leading-snug",
            isError && "text-text-error",
            isDone && "text-on-surface-variant line-through",
            isFired && "text-on-surface-variant",
            !isError && !isDone && !isFired && "text-on-surface",
          )}
        >
          {title}
        </Typography>
        {meta && !isError && (
          <Typography
            variant="label-caps"
            className="mt-1 normal-case text-on-surface-variant"
          >
            {meta}
          </Typography>
        )}
        {isError && (
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-1.5 self-start text-label-caps font-mono uppercase text-text-error"
          >
            <RotateCw className="size-3.5" />
            {errorMessage ?? DEFAULT_ERROR_MESSAGES[kind]}
          </button>
        )}
      </div>
    </div>
  );
}
