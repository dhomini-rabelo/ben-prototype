import { ChatComposer } from "../../layout/components/ui/chat-composer";
import { LedgerPeek } from "../../layout/components/ui/ledger-peek";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { TypingIndicator } from "../../layout/components/ui/typing-indicator";
import { Typography } from "../../layout/components/ui/typography";
import { ChatShell } from "./_chat-shell";

export function ChatAwaitingReply() {
  return (
    <ChatShell
      footer={
        <>
          <LedgerPeek
            variant="up-next"
            title="Pick up milk on the way home"
            meta="in 2h"
          />
          <ChatComposer />
        </>
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="ben">
          morning. what's on the list today?
        </MessageBubble>
        <MessageBubble from="user">
          remind me to pick up milk on the way home around 6
        </MessageBubble>
        <div className="flex w-full justify-start">
          <div className="flex flex-col items-start gap-1">
            <div className="ml-1">
              <Typography
                variant="label-caps"
                className="text-on-surface-variant"
              >
                Ben
              </Typography>
            </div>
            <TypingIndicator />
          </div>
        </div>
      </section>
    </ChatShell>
  );
}
