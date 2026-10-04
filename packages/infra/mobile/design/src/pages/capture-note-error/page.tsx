import { CaptureCard } from "@/layout/components/capture-card/capture-card";
import { ChatInput } from "@/layout/components/chat/chat-input";
import { MessageBubble } from "@/layout/components/chat/message-bubble";
import { ChatShell } from "@/layout/components/common/chat-shell";

export function CaptureNoteErrorPage() {
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
            state="error"
            title="Try 1:16 pour-over ratio this week"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
