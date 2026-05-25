import { MicOff } from "lucide-react";
import { ChatBanner } from "../../layout/components/ui/chat-banner";
import { ChatComposer } from "../../layout/components/ui/chat-composer";
import { LedgerPeek } from "../../layout/components/ui/ledger-peek";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function ChatPermissionDenied() {
  return (
    <ChatShell
      footer={
        <>
          <ChatBanner
            tone="warn"
            icon={MicOff}
            action={{ label: "Show me how" }}
            dismissible
          >
            Ben can't hear you yet — turn on mic in browser settings.
          </ChatBanner>
          <LedgerPeek
            variant="up-next"
            title="Pick up milk on the way home"
            meta="in 2h"
          />
          <ChatComposer placeholder="Type — text works without mic" />
        </>
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="ben">
          morning. what's on the list today?
        </MessageBubble>
        <MessageBubble from="user">
          actually, type works fine for now
        </MessageBubble>
        <MessageBubble from="ben">
          all good — type whenever, the mic's there when you want it.
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
