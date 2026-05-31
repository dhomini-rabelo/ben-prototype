import { CaptureCard } from "../../layout/components/capture-card/capture-card";
import { ChatInput } from "../../layout/components/chat-input";
import { MessageBubble } from "../../layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureReminderFired() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          remind me to call mom on sunday
        </MessageBubble>

        <MessageBubble from="ben">
          got it — here's your reminder from sunday.
          <CaptureCard
            kind="reminder"
            state="fired"
            title="Call mom"
            meta="Sun · 9:00 AM · 3h ago"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
