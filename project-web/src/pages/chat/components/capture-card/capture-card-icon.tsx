import { Bell, List, NotebookPen, Type } from "lucide-react";
import { cn } from "@/layout/utils/styles";
import { useCaptureCard } from "./contexts/capture-card-context";
import type { CaptureCardIcon, CaptureKind, TaskShape } from "./types";

const KIND_ICON: Record<CaptureKind, CaptureCardIcon> = {
  note: NotebookPen,
  reminder: Bell,
  task: Type,
};

const TASK_SHAPE_ICON: Record<TaskShape, CaptureCardIcon> = {
  text: Type,
  list: List,
};

export function CaptureCardIcon() {
  const { kind, state, taskShape } = useCaptureCard();
  const isError = state === "error";
  const isMuted = state === "fired" || state === "finished";
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
