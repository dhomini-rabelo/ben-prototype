import type { ReactNode } from "react";
import { cn } from "../../../../layout/utils/styles";
import { CaptureCardContext } from "./contexts/capture-card-context";
import type { CaptureCardState, CaptureKind, TaskShape } from "./types";

type CaptureCardRootProps = {
  kind: CaptureKind;
  state?: CaptureCardState;
  taskShape?: TaskShape;
  children: ReactNode;
  className?: string;
};

export function CaptureCardRoot({
  kind,
  state = "default",
  taskShape = "text",
  children,
  className,
}: CaptureCardRootProps) {
  const isError = state === "error";
  const isPending = state === "pending";
  const isFired = state === "fired";
  const isFinished = state === "finished";

  return (
    <CaptureCardContext.Provider value={{ kind, state, taskShape }}>
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
        {children}
      </div>
    </CaptureCardContext.Provider>
  );
}
