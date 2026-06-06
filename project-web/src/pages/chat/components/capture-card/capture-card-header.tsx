import { Typography } from "@/layout/components/ui/typography";
import { useCaptureCard } from "./contexts/capture-card-context";
import type { CaptureKind } from "./types";

const KIND_LABEL: Record<CaptureKind, string> = {
  note: "Note",
  reminder: "Reminder",
  task: "Task",
};

export function CaptureCardHeader() {
  const { kind, state } = useCaptureCard();
  const isError = state === "error";
  const isFired = state === "fired";
  const isActive = state === "active";

  return (
    <div className="flex items-center gap-1.5">
      <Typography
        variant="label-caps"
        className={isError ? "text-text-error" : "text-on-surface-variant"}
      >
        {KIND_LABEL[kind]}
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
  );
}
