import { ChatInput } from "@/layout/components/chat-input";
import { MessageBubble } from "@/layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureClarifyingQuestion() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          remind me about the client call
        </MessageBubble>

        <MessageBubble from="ben">
          which client call — the Acme check-in or the onboarding with Sarah?
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
