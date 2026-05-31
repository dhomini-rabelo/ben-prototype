import { RotateCw } from "lucide-react";
import type { CaptureKind } from "./capture-card.types";

const DEFAULT_ERROR_MESSAGES: Record<CaptureKind, string> = {
  note: "couldn't save this note — retry",
  reminder: "couldn't save this reminder — retry",
  task: "couldn't set this up — retry",
};

type CaptureCardErrorButtonProps = {
  kind: CaptureKind;
  errorMessage?: string;
  onAction?: () => void;
};

export function CaptureCardErrorButton({
  kind,
  errorMessage,
  onAction,
}: CaptureCardErrorButtonProps) {
  return (
    <button
      type="button"
      onClick={onAction}
      className="mt-1 inline-flex items-center gap-1.5 self-start text-label-caps font-mono uppercase text-text-error"
    >
      <RotateCw className="size-3.5" />
      {errorMessage ?? DEFAULT_ERROR_MESSAGES[kind]}
    </button>
  );
}
