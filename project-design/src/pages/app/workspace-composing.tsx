import { ChatInput } from "../../layout/components/chat-input";
import { SubThreadBanner } from "../../layout/components/sub-thread-banner";
import { Typography } from "../../layout/components/ui/typography";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceComposing() {
  return (
    <WorkspaceShell
      title="Draft the Q3 brief"
      contentType="text"
      banner={
        <SubThreadBanner
          variant="ben-reply"
          text="tightened the intro — want me to take a pass at the closing?"
        />
      }
      footer={
        <ChatInput
          mode="composing"
          value="rewrite the closing to land on the marketing cadence first"
        />
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2 opacity-70">
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface"
        >
          Q3 is the quarter we stop apologizing for the rough edges of the
          product and start charging for the parts that already work…
        </Typography>
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface-variant"
        >
          On pricing — we move to per-seat with a starter band that holds the
          existing low-touch customers.
        </Typography>
      </section>
    </WorkspaceShell>
  );
}
