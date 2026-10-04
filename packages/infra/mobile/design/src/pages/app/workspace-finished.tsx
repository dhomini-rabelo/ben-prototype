import { Check } from "lucide-react";
import { ChatInput } from "@/layout/components/chat-input";
import { Typography } from "@/layout/components/ui/typography";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceFinished() {
  return (
    <WorkspaceShell
      title="Draft the Q3 brief"
      contentType="text"
      finishedIndicator
      footer={<ChatInput mode="disabled" placeholder="reopen to keep editing" />}
      overlay={
        <div className="pointer-events-none fixed inset-0 z-30 flex items-end justify-center bg-on-surface/5 pb-44">
          <div className="flex items-center gap-2 rounded-full bg-primary/95 px-4 py-2 text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <Check className="size-4" strokeWidth={2.25} />
            <Typography variant="body-md" className="text-on-primary">
              nice. that one's done.
            </Typography>
          </div>
        </div>
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2 opacity-60">
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface-variant line-through"
        >
          Q3 is the quarter we stop apologizing for the rough edges of the
          product and start charging for the parts that already work.
        </Typography>
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface-variant line-through"
        >
          On pricing — we move to per-seat with a starter band that holds the
          existing low-touch customers.
        </Typography>
      </section>
    </WorkspaceShell>
  );
}
