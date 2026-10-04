import { CaptureCard } from "@/layout/components/capture-card/capture-card";
import { ChatInput } from "@/layout/components/chat-input";
import { MessageBubble } from "@/layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureTaskError() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          add a task to draft the q3 brief by friday
        </MessageBubble>

        <MessageBubble from="ben">
          hit a snag setting that up.
          <CaptureCard
            kind="task"
            state="error"
            taskShape="text"
            title="Draft the Q3 brief"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
