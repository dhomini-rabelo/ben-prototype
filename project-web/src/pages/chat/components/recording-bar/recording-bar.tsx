import { ArrowUp, Mic } from "lucide-react";
import { Typography } from "../../../../layout/components/ui/typography";
import { cn } from "../../../../layout/utils/styles";

const WAVEFORM_BARS = [
  10, 18, 28, 22, 32, 14, 26, 36, 20, 30, 16, 24, 34, 18, 28,
];

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type RecordingBarProps = {
  elapsedSeconds: number;
  maxSeconds?: number;
  onStop?: () => void;
  onCancel?: () => void;
  className?: string;
};

export function RecordingBar({
  elapsedSeconds,
  maxSeconds,
  onStop,
  onCancel,
  className,
}: RecordingBarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-text-error" />
            <Typography variant="label-caps" className="text-text-error">
              Recording
            </Typography>
          </div>
          <Typography
            variant="label-caps"
            className="font-mono normal-case text-on-surface-variant"
          >
            {formatTime(elapsedSeconds)}
            {maxSeconds !== undefined && ` / ${formatTime(maxSeconds)}`}
          </Typography>
        </div>
        <div className="flex h-8 items-center justify-center gap-1">
          {WAVEFORM_BARS.map((height, index) => (
            <span
              key={index}
              className="w-1 rounded-full bg-primary/80"
              style={{
                height: `${height}px`,
                animation: `pulse 0.9s ease-in-out ${index * 60}ms infinite`,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Cancel recording"
          onClick={onCancel}
          className="flex items-center justify-center gap-2 text-on-surface-variant"
        >
          <ArrowUp className="size-3.5" />
          <Typography variant="label-caps">Slide up to cancel</Typography>
        </button>
      </div>

      <button
        type="button"
        aria-label="Stop recording"
        onClick={onStop}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-text-error text-on-primary ring-4 ring-text-error/20"
      >
        <Mic className="size-5" />
      </button>
    </div>
  );
}
