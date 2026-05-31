import { Bell, List, NotebookPen, Type } from "lucide-react";
import { cn } from "../../../../layout/utils/styles";
import type { CaptureCardIcon, CaptureKind, TaskShape } from "./capture-card.types";

const KIND_ICON: Record<CaptureKind, CaptureCardIcon> = {
  note: NotebookPen,
  reminder: Bell,
  task: Type,
};

const TASK_SHAPE_ICON: Record<TaskShape, CaptureCardIcon> = {
  text: Type,
  list: List,
};

type CaptureCardIconProps = {
  kind: CaptureKind;
  taskShape: TaskShape;
  isError: boolean;
  isMuted: boolean;
};

export function CaptureCardIcon({
  kind,
  taskShape,
  isError,
  isMuted,
}: CaptureCardIconProps) {
  const Icon = kind === "task" ? TASK_SHAPE_ICON[taskShape] : KIND_ICON[kind];

  return (
    <span
      className={cn(
        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
        isError
          ? "bg-surface-error text-text-error"
          : isMuted
            ? "bg-surface-container-high text-on-surface-variant/60"
            : "bg-surface-container-high text-on-surface-variant",
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  );
}
