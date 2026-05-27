import { ChatInput } from "../../layout/components/chat-input";
import { Typography } from "../../layout/components/ui/typography";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceEmpty() {
  return (
    <WorkspaceShell
      title="Draft the Q3 brief"
      contentType="text"
      footer={<ChatInput placeholder="Tell Ben what to put here…" />}
    >
      <section className="flex flex-1 flex-col items-center justify-center gap-3 px-4 pb-8 text-center">
        <Typography variant="body-md" className="text-on-surface-variant">
          what's first?
        </Typography>
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant/70"
        >
          dictate, type, or ask Ben to start it for you
        </Typography>
      </section>
    </WorkspaceShell>
  );
}
