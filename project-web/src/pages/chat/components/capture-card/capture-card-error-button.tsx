import { RotateCw } from "lucide-react";
import { useCaptureCard } from "./contexts/capture-card-context";
import type { CaptureKind } from "./types";

const DEFAULT_ERROR_MESSAGES: Record<CaptureKind, string> = {
  note: "couldn't save this note — retry",
  reminder: "couldn't save this reminder — retry",
  task: "couldn't set this up — retry",
};

type CaptureCardErrorButtonProps = {
  errorMessage?: string;
  onAction?: () => void;
};

export function CaptureCardErrorButton({
  errorMessage,
  onAction,
}: CaptureCardErrorButtonProps) {
  const { kind, state } = useCaptureCard();

  if (state !== "error") {
    return null;
  }

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
