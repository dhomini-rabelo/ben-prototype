import { ChatInput } from "../../layout/components/chat-input";
import { SubThreadBanner } from "../../layout/components/sub-thread-banner";
import { Typography } from "../../layout/components/ui/typography";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceTextPopulated() {
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
      footer={<ChatInput placeholder="Ask Ben to edit…" />}
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface"
        >
          Q3 is the quarter we stop apologizing for the rough edges of the
          product and start charging for the parts that already work. The brief
          should land on three moves: pricing reset, a focused onboarding push,
          and a quieter, more deliberate marketing cadence.
        </Typography>
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface"
        >
          On pricing — we move to per-seat with a starter band that holds the
          existing low-touch customers. On onboarding, we cut the steps in half
          and lean into the voice-first capture flow that already converts. On
          marketing, fewer launches, deeper essays, and one founder-driven
          event per month.
        </Typography>
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface-variant"
        >
          Open questions: what's the floor on the starter band, and who owns
          the onboarding rewrite end-to-end?
        </Typography>
      </section>
    </WorkspaceShell>
  );
}
