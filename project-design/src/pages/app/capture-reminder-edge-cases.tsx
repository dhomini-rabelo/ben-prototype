import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureReminderEdgeCases() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="user">
          remind me yesterday to prep for the monday call
        </MessageBubble>

        <MessageBubble from="ben">
          saved — here it is:
          <CaptureCard
            kind="reminder"
            state="fired"
            title="Prep for Monday call"
            meta="Yesterday · 9:00 AM · 1 day ago"
          />
        </MessageBubble>

        <MessageBubble from="user">
          remind me to renew the domain in 2 years
        </MessageBubble>

        <MessageBubble from="ben">
          filed.
          <CaptureCard
            kind="reminder"
            state="default"
            title="Renew the domain"
            meta="May 2028 · in 2 years"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
