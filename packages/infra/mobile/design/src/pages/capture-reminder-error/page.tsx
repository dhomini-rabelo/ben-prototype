import { CaptureCard } from "@/layout/components/capture-card/capture-card";
import { ChatInput } from "@/layout/components/chat/chat-input";
import { MessageBubble } from "@/layout/components/chat/message-bubble";
import { ChatShell } from "@/layout/components/common/chat-shell";

export function CaptureReminderErrorPage() {
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
            state="error"
            title="Call mom"
            meta="Sun · 9:00 AM"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
