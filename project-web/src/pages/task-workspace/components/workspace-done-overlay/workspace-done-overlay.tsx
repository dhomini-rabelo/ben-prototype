import { Check } from "lucide-react";
import { Typography } from "@/layout/components/ui/typography";

export function WorkspaceDoneOverlay() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-40 flex h-dvh w-full max-w-120 -translate-x-1/2 items-end justify-center bg-on-surface/5 pb-44">
      <div className="flex items-center gap-2 rounded-full bg-primary/95 px-4 py-2 text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <Check className="size-4" strokeWidth={2.25} />
        <Typography variant="body-md">
          nice. that one's done.
        </Typography>
      </div>
    </div>
  );
}
