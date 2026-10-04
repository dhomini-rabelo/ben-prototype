import { CaptureCard } from "@/layout/components/capture-card/capture-card";
import { ChatInput } from "@/layout/components/chat/chat-input";
import { MessageBubble } from "@/layout/components/chat/message-bubble";
import { ChatShell } from "@/layout/components/common/chat-shell";

export function CaptureReminderFiredPage() {
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
