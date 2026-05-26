import { useState } from "react";
import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureTaskOpen() {
  const [done, setDone] = useState(false);

  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          add a task to draft the q3 brief by friday
        </MessageBubble>

        <MessageBubble from="ben">
          on it.
          <CaptureCard
            kind="task"
            state={done ? "done" : "default"}
            title="Draft the Q3 brief"
            onToggle={() => setDone((d) => !d)}
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
