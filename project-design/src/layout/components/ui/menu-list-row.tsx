import { Bell, List, NotebookPen, Type } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "../../../core/cn";
import { Typography } from "./typography";

export type MenuListRowKind = "task-text" | "task-list" | "note" | "reminder";

type MenuListRowProps = {
  kind: MenuListRowKind;
  title: string;
  supporting?: string;
  trailing?: string;
  bodyPreview?: string;
  muted?: boolean;
  emphasizeTrailing?: boolean;
  className?: string;
  onClick?: () => void;
};

const KIND_ICON: Record<
  MenuListRowKind,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  "task-text": Type,
  "task-list": List,
  note: NotebookPen,
  reminder: Bell,
};

export function MenuListRow({
  kind,
  title,
  supporting,
  trailing,
  bodyPreview,
  muted,
  emphasizeTrailing,
  className,
  onClick,
}: MenuListRowProps) {
  const Icon = KIND_ICON[kind];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant",
          muted && "opacity-60",
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline gap-2">
          <Typography
            variant="body-md"
            className={cn(
              "truncate font-semibold",
              muted ? "text-on-surface-variant" : "text-on-surface",
            )}
          >
            {title}
          </Typography>
          {trailing && (
            <Typography
              variant="label-caps"
              className={cn(
                "ml-auto shrink-0 normal-case",
                emphasizeTrailing
                  ? "font-semibold text-on-surface"
                  : "text-on-surface-variant/70",
                muted && "text-on-surface-variant/70",
              )}
            >
              {trailing}
            </Typography>
          )}
        </div>
        {bodyPreview && (
          <Typography
            variant="body-md"
            className={cn(
              "truncate text-on-surface-variant",
              muted && "text-on-surface-variant/70",
            )}
          >
            {bodyPreview}
          </Typography>
        )}
        {supporting && (
          <Typography
            variant="label-caps"
            className={cn(
              "normal-case",
              muted ? "text-on-surface-variant/60" : "text-on-surface-variant",
            )}
          >
            {supporting}
          </Typography>
        )}
      </div>
    </button>
  );
}
