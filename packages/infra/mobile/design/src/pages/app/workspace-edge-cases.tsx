import { ChatInput } from "@/layout/components/chat-input";
import { SubThreadBanner } from "@/layout/components/sub-thread-banner";
import { Typography } from "@/layout/components/ui/typography";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceEdgeCases() {
  return (
    <WorkspaceShell
      title="Annual review notes"
      contentType="text"
      finishedIndicator
      banner={
        <SubThreadBanner
          variant="ben-reply"
          text="your edits made the diff stale — ask Ben to redo those"
        />
      }
      footer={<ChatInput mode="disabled" placeholder="reopen to edit" />}
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          Read-only · reopen from overflow to edit
        </Typography>
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface"
        >
          Looking back at the year — the biggest unlock was deciding which
          customer we were not for. Everything downstream of that got faster.
          Pricing was easier. Onboarding was easier. Marketing was easier.
        </Typography>
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface"
        >
          The mistake to not repeat: spending Q1 building three different
          activation flows instead of picking one and watching it work. The
          right ratio is one careful build to three rounds of observation.
        </Typography>
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface-variant"
        >
          For Q3, the discipline is to keep the surface area narrow and let
          Ben handle the rest.
        </Typography>
      </section>
    </WorkspaceShell>
  );
}
