import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureNoteLoading() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          add a note — i want to try using a 1:16 pour-over ratio this week
        </MessageBubble>

        <MessageBubble from="ben">
          noted.
          <CaptureCard
            kind="note"
            state="pending"
            title="Try 1:16 pour-over ratio this week"
            meta="Note · just now"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
