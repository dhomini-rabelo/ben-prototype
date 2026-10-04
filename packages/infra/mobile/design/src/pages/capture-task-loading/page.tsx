import { ActiveTaskPeek } from "@/layout/components/workspace/active-task-peek";
import { CaptureCard } from "@/layout/components/capture-card/capture-card";
import { ChatInput } from "@/layout/components/chat/chat-input";
import { MessageBubble } from "@/layout/components/chat/message-bubble";
import { ChatShell } from "@/layout/components/common/chat-shell";

export function CaptureTaskLoadingPage() {
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
