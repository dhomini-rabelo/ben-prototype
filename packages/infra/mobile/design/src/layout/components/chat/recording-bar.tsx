import { ArrowUp, X } from "lucide-react";

type RecordingBarProps = {
  elapsed?: string;
};

const WAVE_BARS = [10, 18, 28, 22, 32, 14, 26, 36, 20, 30, 16, 24, 34, 18, 28];

export function RecordingBar({ elapsed = "0:07" }: RecordingBarProps) {
  return (
    <div className="flex h-[44px] w-full flex-row items-center gap-2 rounded-full border-[1.5px] border-field-border bg-surface-container-lowest px-1.5">
      <button
        type="button"
        aria-label="Cancel recording"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface"
      >
        <X className="size-4" />
      </button>
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-text-error" />
      <span className="font-mono text-[11px] text-on-surface-variant">
        {elapsed}
      </span>
      <div className="flex h-7 flex-1 items-center justify-center gap-1">
        {WAVE_BARS.map((height, index) => (
          <span
            key={index}
            className="w-1 rounded-full bg-wave"
            style={{
              height: `${Math.round(height * 0.6)}px`,
              animation: `pulse 0.9s ease-in-out ${index * 60}ms infinite`,
            }}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="Send recording"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}
