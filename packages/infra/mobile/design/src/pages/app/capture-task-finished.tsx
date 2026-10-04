import { CaptureCard } from "@/layout/components/capture-card/capture-card";
import { ChatInput } from "@/layout/components/chat-input";
import { MessageBubble } from "@/layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureTaskFinished() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          add a task to draft the q3 brief by friday
        </MessageBubble>

        <MessageBubble from="ben">
          set up a space for it — tap Start when you're ready.
          <CaptureCard
            kind="task"
            state="default"
            taskShape="text"
            title="Draft the Q3 brief"
          />
        </MessageBubble>

        <MessageBubble from="user">
          all done — wrap that one
        </MessageBubble>

        <MessageBubble from="ben">
          nicely done — filed under finished.
          <CaptureCard
            kind="task"
            state="finished"
            taskShape="text"
            title="Draft the Q3 brief"
            supportingText="finished 3h ago"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
