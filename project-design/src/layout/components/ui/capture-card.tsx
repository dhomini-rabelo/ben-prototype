import {
  Bell,
  ChevronRight,
  List,
  NotebookPen,
  Play,
  RotateCw,
  Type,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "../../utils/cn";
import { Typography } from "./typography";

type CaptureKind = "note" | "reminder" | "task";
type TaskShape = "text" | "list";

type CaptureCardProps = {
  kind: CaptureKind;
  title: string;
  meta?: string;
  state?: "default" | "pending" | "error" | "active" | "finished" | "fired";
  taskShape?: TaskShape;
  actionLabel?: string;
  supportingText?: string;
  onAction?: () => void;
  errorMessage?: string;
  className?: string;
};

const KIND_META: Record<
  CaptureKind,
  {
    label: string;
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  note: { label: "Note", icon: NotebookPen },
  reminder: { label: "Reminder", icon: Bell },
  task: { label: "Task", icon: Type },
};

const TASK_SHAPE_ICON: Record<
  TaskShape,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  text: Type,
  list: List,
};

const DEFAULT_ERROR_MESSAGES: Record<CaptureKind, string> = {
  note: "couldn't save this note — retry",
  reminder: "couldn't save this reminder — retry",
  task: "couldn't set this up — retry",
};

const DEFAULT_TASK_ACTION_LABEL: Record<
  NonNullable<CaptureCardProps["state"]>,
  string
> = {
  default: "Start",
  pending: "Start",
  active: "Continue",
  finished: "View",
  error: "Start",
  fired: "Start",
};

export function CaptureCard({
  kind,
  title,
  meta,
  state = "default",
  taskShape = "text",
  actionLabel,
  supportingText,
  onAction,
  errorMessage,
  className,
}: CaptureCardProps) {
  const { label } = KIND_META[kind];
  const Icon =
    kind === "task" ? TASK_SHAPE_ICON[taskShape] : KIND_META[kind].icon;

  const isError = state === "error";
  const isPending = state === "pending";
  const isFired = state === "fired";
  const isActive = state === "active";
  const isFinished = state === "finished";
  const isTask = kind === "task";

  const resolvedActionLabel =
    actionLabel ?? (isTask ? DEFAULT_TASK_ACTION_LABEL[state] : undefined);

  return (
    <div
      className={cn(
        "mt-2 flex items-start gap-3 rounded-xl border bg-surface-container-lowest px-3.5 py-3",
        isError && "border-text-error/30 bg-surface-error",
        isPending && "border-outline-variant/30 opacity-80",
        isFinished && "border-outline-variant/40 bg-surface-container-low",
        isFired && "border-outline-variant/40 bg-surface-container-low",
        !isError &&
          !isPending &&
          !isFinished &&
          !isFired &&
          "border-outline-variant/50",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
          isError
            ? "bg-surface-error text-text-error"
            : isFired || isFinished
              ? "bg-surface-container-high text-on-surface-variant/60"
              : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Typography
            variant="label-caps"
            className={isError ? "text-text-error" : "text-on-surface-variant"}
          >
            {label}
          </Typography>
          {isFired && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/60">
              · fired
            </span>
          )}
          {isActive && (
            <span className="rounded-full bg-primary/10 px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-primary">
              active
            </span>
          )}
        </div>
        <Typography
          variant="body-md"
          className={cn(
            "leading-snug",
            isError && "text-text-error",
            isFinished && "text-on-surface-variant line-through",
            isFired && "text-on-surface-variant",
            !isError && !isFinished && !isFired && "text-on-surface",
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
        {supportingText && !isError && (
          <Typography
            variant="label-caps"
            className="mt-1 normal-case text-on-surface-variant/80"
          >
            {supportingText}
          </Typography>
        )}
        {isError && (
          <button
            type="button"
            onClick={onAction}
            className="mt-1 inline-flex items-center gap-1.5 self-start text-label-caps font-mono uppercase text-text-error"
          >
            <RotateCw className="size-3.5" />
            {errorMessage ?? DEFAULT_ERROR_MESSAGES[kind]}
          </button>
        )}

        {isTask && resolvedActionLabel && !isError && (
          <button
            type="button"
            onClick={onAction}
            disabled={isPending}
            className={cn(
              "mt-2 inline-flex shrink-0 items-center gap-1 self-end rounded-full px-3 py-1.5 text-label-caps font-semibold uppercase tracking-wider transition-colors",
              isFinished
                ? "bg-transparent text-on-surface-variant hover:text-on-surface"
                : "bg-primary text-on-primary hover:bg-surface-tint",
              isPending && "pointer-events-none opacity-60",
            )}
          >
            {!isFinished && !isActive && (
              <Play className="size-3" strokeWidth={2.5} />
            )}
            {resolvedActionLabel}
            {isFinished && <ChevronRight className="size-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
