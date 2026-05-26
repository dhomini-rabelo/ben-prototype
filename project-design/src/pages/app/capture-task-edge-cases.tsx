import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureTaskEdgeCases() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          add a task — rewrite the q3 positioning paragraph, add integration
          story section, tighten pricing table removing legacy tier, and sync
          marketing before monday
        </MessageBubble>

        <MessageBubble from="ben">
          parsed — here's the most important one:
          <CaptureCard
            kind="task"
            state="default"
            title="Rewrite Q3 brief positioning paragraph for ops-buyer audience, add integration story section and tighten pricing table"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
