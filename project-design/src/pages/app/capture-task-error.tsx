import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureTaskError() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="user">
          add a task to draft the q3 brief by friday
        </MessageBubble>

        <MessageBubble from="ben">
          on it.
          <CaptureCard
            kind="task"
            state="error"
            title="Draft the Q3 brief"
          />
        </MessageBubble>

        <MessageBubble from="ben">
          on it.
          <CaptureCard
            kind="task"
            state="error"
            title="Loop in marketing by Monday"
            errorMessage="didn't go through — retry"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
