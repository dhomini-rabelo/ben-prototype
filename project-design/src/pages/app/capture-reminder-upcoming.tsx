import { CaptureCard } from "../../layout/components/capture-card/capture-card";
import { ChatInput } from "../../layout/components/chat-input";
import { MessageBubble } from "../../layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureReminderUpcoming() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          remind me to call mom on sunday
        </MessageBubble>

        <MessageBubble from="ben">
          got it.
          <CaptureCard
            kind="reminder"
            state="default"
            title="Call mom"
            meta="Sun · 9:00 AM · in 4 days"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
