import { List, RotateCw, Type } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/layout/utils/cn";
import { Typography } from "./ui/typography";

export type TaskPickerRow = {
  id: string;
  title: string;
  shape: "text" | "list";
  supporting: string;
};

type TaskPickerSheetProps = {
  variant?: "empty" | "loading" | "populated" | "error";
  tasks?: TaskPickerRow[];
  long?: boolean;
  className?: string;
  onSelect?: (id: string) => void;
  onRetry?: () => void;
  onDismiss?: () => void;
};

const SHAPE_ICON: Record<
  TaskPickerRow["shape"],
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  text: Type,
  list: List,
};

export function TaskPickerSheet({
  variant = "populated",
  tasks = [],
  long,
  className,
  onSelect,
  onRetry,
}: TaskPickerSheetProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-t-3xl bg-surface-container-lowest pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="flex items-center justify-center px-5 pt-3 pb-2">
        <span className="h-1 w-10 rounded-full bg-outline-variant/60" />
      </div>
      <div className="flex items-center justify-between px-5 pt-1 pb-3">
        <Typography variant="label-caps" className="text-on-surface-variant">
          Active tasks
        </Typography>
        {variant === "populated" && tasks.length > 0 && (
          <Typography
            variant="label-caps"
            className="normal-case text-on-surface-variant/70"
          >
            {tasks.length} · most recent first
          </Typography>
        )}
      </div>

      {variant === "empty" && (
        <div className="flex flex-col items-center gap-2 px-5 pt-4 pb-6 text-center">
          <Typography variant="body-md" className="text-on-surface">
            nothing active — you're all clear
          </Typography>
          <Typography
            variant="label-caps"
            className="normal-case text-on-surface-variant"
          >
            tap outside to head back to chat
          </Typography>
        </div>
      )}

      {variant === "loading" && (
        <div className="flex flex-col gap-1 px-3 pb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5"
            >
              <div className="size-8 animate-pulse rounded-lg bg-outline-variant/40" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-outline-variant/40" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-outline-variant/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "error" && (
        <div className="mx-5 mb-5 flex items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
          <Typography variant="body-md" className="text-text-error">
            couldn't load your tasks
          </Typography>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-full bg-text-error px-3 py-1.5 text-label-caps font-mono uppercase text-on-primary"
          >
            <RotateCw className="size-3" /> retry
          </button>
        </div>
      )}

      {variant === "populated" && (
        <div
          className={cn(
            "flex flex-col px-2 pb-2",
            long && "max-h-[420px] overflow-y-auto",
          )}
        >
          {tasks.map((t) => {
            const Icon = SHAPE_ICON[t.shape];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect?.(t.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Typography
                    variant="body-md"
                    className="truncate text-on-surface"
                  >
                    {t.title}
                  </Typography>
                  <Typography
                    variant="label-caps"
                    className="normal-case text-on-surface-variant"
                  >
                    {t.supporting}
                  </Typography>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
