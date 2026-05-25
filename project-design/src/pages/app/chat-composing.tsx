import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatComposer } from "../../layout/components/ui/chat-composer";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function ChatComposing() {
  return (
    <ChatShell
      footer={
        <ChatComposer
          mode="composing"
          value="remind me to call mom tomorrow at"
        />
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="user">
          add a task to draft the q3 brief by friday
        </MessageBubble>
        <MessageBubble from="ben">
          on it.
          <CaptureCard
            kind="task"
            title="Draft the Q3 brief"
            meta="Due Fri · 2026-05-29"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
