import { Typography } from "../../../../layout/components/ui/typography";
import type { CaptureKind } from "./capture-card.types";

const KIND_LABEL: Record<CaptureKind, string> = {
  note: "Note",
  reminder: "Reminder",
  task: "Task",
};

type CaptureCardHeaderProps = {
  kind: CaptureKind;
  isError: boolean;
  isFired: boolean;
  isActive: boolean;
};

export function CaptureCardHeader({
  kind,
  isError,
  isFired,
  isActive,
}: CaptureCardHeaderProps) {
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
