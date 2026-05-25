import { ChatComposer } from "../../layout/components/ui/chat-composer";
import { LedgerPeek } from "../../layout/components/ui/ledger-peek";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function ChatLoading() {
  return (
    <ChatShell
      footer={
        <>
          <LedgerPeek variant="skeleton" />
          <ChatComposer />
        </>
      }
    >
      <section className="flex flex-1 flex-col gap-3 pt-2">
        <MessageBubble from="ben" state="skeleton" />
        <div className="flex w-full justify-end">
          <div className="h-9 w-56 animate-pulse rounded-2xl rounded-tr-sm bg-surface-container-high" />
        </div>
        <MessageBubble from="ben" state="skeleton" />
        <div className="flex w-full justify-end">
          <div className="h-9 w-32 animate-pulse rounded-2xl rounded-tr-sm bg-surface-container-high" />
        </div>
        <MessageBubble from="ben" state="skeleton" />
      </section>
    </ChatShell>
  );
}
