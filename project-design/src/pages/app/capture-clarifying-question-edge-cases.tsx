import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureClarifyingQuestionEdgeCases() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="user">
          remind me about the call
        </MessageBubble>

        <MessageBubble from="ben">
          which call — Acme or Sarah's onboarding?
        </MessageBubble>

        <MessageBubble from="user">
          sarah
        </MessageBubble>

        <MessageBubble from="ben">
          got it — what time should I remind you?
        </MessageBubble>

        <MessageBubble from="user">
          30 minutes before, it's at 3
        </MessageBubble>

        <MessageBubble from="ben">
          got it — saved.
          <CaptureCard
            kind="reminder"
            state="default"
            title="Sarah onboarding call"
            meta="Today · 2:30 PM · in 45m"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
