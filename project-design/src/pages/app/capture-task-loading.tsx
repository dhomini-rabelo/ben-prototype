import { ActiveTaskPeek } from "../../layout/components/active-task-peek";
import { CaptureCard } from "../../layout/components/capture-card";
import { ChatInput } from "../../layout/components/chat-input";
import { MessageBubble } from "../../layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureTaskLoading() {
  return (
    <ChatShell
      footer={<ChatInput />}
      peek={<ActiveTaskPeek variant="summary" count={1} title="Loop in marketing by Monday" />}
    >
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          add a task to draft the q3 brief by friday
        </MessageBubble>

        <MessageBubble from="ben">
          setting up a workspace for this.
          <CaptureCard
            kind="task"
            state="pending"
            taskShape="text"
            title="Draft the Q3 brief"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
