import { MicOff } from "lucide-react";
import { ChatBanner } from "../../layout/components/ui/chat-banner";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { Typography } from "../../layout/components/ui/typography";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspacePermissionDenied() {
  return (
    <WorkspaceShell
      title="Draft the Q3 brief"
      contentType="text"
      banner={
        <ChatBanner
          tone="warn"
          icon={MicOff}
          action={{ label: "Show me how" }}
          dismissible
        >
          Ben can't hear you yet — turn on mic in browser settings.
        </ChatBanner>
      }
      footer={<ChatInput placeholder="Type — text works without mic" />}
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <Typography
          variant="body-md"
          className="leading-relaxed text-on-surface"
        >
          Q3 is the quarter we stop apologizing for the rough edges of the
          product and start charging for the parts that already work.
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
