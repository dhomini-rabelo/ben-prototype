import { ArrowUp, Mic } from "lucide-react";
import { Typography } from "../../layout/components/ui/typography";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceRecording() {
  const bars = [10, 18, 28, 22, 32, 14, 26, 36, 20, 30, 16, 24, 34, 18, 28];

  return (
    <WorkspaceShell
      title="Draft the Q3 brief"
      contentType="text"
      overlay={
        <div className="pointer-events-none fixed inset-0 z-30 bg-on-surface/10" />
      }
      footer={
        <div className="flex items-center gap-3">
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
                0:04 / 0:30
              </Typography>
            </div>
            <div className="flex h-8 items-center justify-center gap-1">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-primary/80"
                  style={{
                    height: `${h}px`,
                    animation: `pulse 0.9s ease-in-out ${i * 60}ms infinite`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-on-surface-variant">
              <ArrowUp className="size-3.5" />
              <Typography variant="label-caps">Slide up to cancel</Typography>
            </div>
          </div>
          <button
            aria-label="Recording"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-text-error text-on-primary ring-4 ring-text-error/20"
          >
            <Mic className="size-5" />
          </button>
        </div>
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2 opacity-40">
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface"
        >
          Q3 is the quarter we stop apologizing for the rough edges…
        </Typography>
      </section>
    </WorkspaceShell>
  );
}
