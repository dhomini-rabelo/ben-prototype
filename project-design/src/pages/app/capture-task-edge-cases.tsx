import { ActiveTaskPeek } from "../../layout/components/active-task-peek";
import { CaptureCard } from "../../layout/components/capture-card/capture-card";
import { ChatInput } from "../../layout/components/chat-input";
import { MessageBubble } from "../../layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureTaskEdgeCases() {
  return (
    <ChatShell
      footer={<ChatInput />}
      peek={<ActiveTaskPeek variant="summary" count={3} title="Rewrite Q3 positioning paragraph" />}
    >
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          add a task — rewrite the q3 positioning paragraph, add integration
          story section, tighten pricing table removing legacy tier, and sync
          marketing before monday
        </MessageBubble>

        <MessageBubble from="ben">
          set this up — long one, full title is in the workspace.
          <CaptureCard
            kind="task"
            state="default"
            taskShape="text"
            title="Rewrite Q3 brief positioning paragraph for ops-buyer audience, add integration story section and tighten pricing table"
          />
        </MessageBubble>

        <MessageBubble from="ben">
          and one from earlier — never opened, still here when you want it.
          <CaptureCard
            kind="task"
            state="default"
            taskShape="list"
            title="Packing for the offsite"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
