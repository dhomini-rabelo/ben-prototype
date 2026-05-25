import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatComposer } from "../../layout/components/ui/chat-composer";
import { LedgerPeek } from "../../layout/components/ui/ledger-peek";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function ChatPopulated() {
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

        <MessageBubble from="ben">
          got it — saved.
          <CaptureCard
            kind="reminder"
            title="Pick up milk on the way home"
            meta="Today · 6:00 PM"
          />
        </MessageBubble>

        <MessageBubble from="user">
          and jot down: try the new pour-over ratio, 1:16
        </MessageBubble>

        <MessageBubble from="ben">
          noted.
          <CaptureCard
            kind="note"
            title="Try the new pour-over ratio, 1:16"
          />
        </MessageBubble>

        <MessageBubble from="user">
          add a task to draft the q3 brief by friday
        </MessageBubble>

        <MessageBubble from="ben">
          on it.
          <CaptureCard
            kind="task"
            title="Draft the Q3 brief"
            meta="Due Fri · 2026-05-29"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
