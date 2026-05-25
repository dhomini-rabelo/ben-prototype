import { Bell, CheckSquare, NotebookPen, RotateCw } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "../../../core/cn";
import { Typography } from "./typography";

type CaptureKind = "note" | "reminder" | "task";

type CaptureCardProps = {
  kind: CaptureKind;
  title: string;
  meta?: string;
  state?: "default" | "error";
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

export function CaptureCard({
  kind,
  title,
  meta,
  state = "default",
  className,
}: CaptureCardProps) {
  const { label, icon: Icon } = KIND_META[kind];
  const isError = state === "error";

  return (
    <div
      className={cn(
        "mt-2 flex items-start gap-3 rounded-xl border bg-surface-container-lowest px-3.5 py-3",
        isError
          ? "border-text-error/30 bg-surface-error"
          : "border-outline-variant/50",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
          isError
            ? "bg-surface-error text-text-error"
            : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typography
          variant="label-caps"
          className={
            isError ? "text-text-error" : "text-on-surface-variant"
          }
        >
          {label}
        </Typography>
        <Typography
          variant="body-md"
          className={cn(
            "leading-snug",
            isError ? "text-text-error" : "text-on-surface",
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
            couldn't save — retry
          </button>
        )}
      </div>
    </div>
  );
}
