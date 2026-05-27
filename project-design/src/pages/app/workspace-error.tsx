import { AlertTriangle, RotateCw } from "lucide-react";
import { ChatBanner } from "../../layout/components/chat-banner";
import { ChatInput } from "../../layout/components/chat-input";
import { DiffBar } from "../../layout/components/diff-bar";
import { SubThreadBanner } from "../../layout/components/sub-thread-banner";
import { Typography } from "../../layout/components/ui/typography";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceError() {
  return (
    <WorkspaceShell
      title="Draft the Q3 brief"
      contentType="text"
      banner={
        <SubThreadBanner
          variant="error"
          meta="Ben"
          text="Ben couldn't reply"
        />
      }
      diffBar={<DiffBar state="error" />}
      topBanner={
        <ChatBanner tone="error" icon={AlertTriangle} action={{ label: "Retry" }}>
          couldn't load this one — tap to retry
        </ChatBanner>
      }
      footer={<ChatInput />}
    >
      <section className="flex flex-1 flex-col items-center justify-center gap-3 pt-2">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-error text-text-error">
          <RotateCw className="size-5" strokeWidth={1.75} />
        </span>
        <Typography variant="body-md" className="text-on-surface-variant">
          we'll bring this back when the network steadies
        </Typography>
      </section>
    </WorkspaceShell>
  );
}
