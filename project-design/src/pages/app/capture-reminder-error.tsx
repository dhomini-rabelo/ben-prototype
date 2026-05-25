import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureReminderError() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="user">
          remind me to call mom on sunday
        </MessageBubble>

        <MessageBubble from="ben">
          got it.
          <CaptureCard
            kind="reminder"
            state="error"
            title="Call mom"
            meta="Sun · 9:00 AM"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
