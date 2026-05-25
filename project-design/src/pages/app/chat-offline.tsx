import { CloudOff } from "lucide-react";
import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatBanner } from "../../layout/components/ui/chat-banner";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { LedgerPeek } from "../../layout/components/ui/ledger-peek";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { Typography } from "../../layout/components/ui/typography";
import { ChatShell } from "./_chat-shell";

export function ChatOffline() {
  return (
    <ChatShell
      topBanner={
        <ChatBanner tone="warn" icon={CloudOff} dismissible>
          offline — Ben's listening but can't reply yet
        </ChatBanner>
      }
      footer={
        <>
          <LedgerPeek
            variant="up-next"
            title="Pick up milk on the way home"
            meta="in 2h"
          />
          <ChatInput placeholder="Message Ben (queued)" />
        </>
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="ben">
          got it — saved.
          <CaptureCard
            kind="reminder"
            title="Pick up milk on the way home"
            meta="Today · 6:00 PM"
          />
        </MessageBubble>

        <MessageBubble
          from="user"
          state="pending"
          footer={
            <Typography
              variant="label-caps"
              className="pr-2 text-on-surface-variant"
            >
              Queued · sends on reconnect
            </Typography>
          }
        >
          and add a task: finalize the deck before friday
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
