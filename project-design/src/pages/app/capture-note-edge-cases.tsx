import { CaptureCard } from "../../layout/components/capture-card";
import { ChatInput } from "../../layout/components/chat-input";
import { MessageBubble } from "../../layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function CaptureNoteEdgeCases() {
  return (
    <ChatShell footer={<ChatInput />}>
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="ben">
          jotted it down.
          <CaptureCard
            kind="note"
            state="default"
            title="untitled note"
            meta="the placeholder when model returns empty title"
          />
        </MessageBubble>

        <MessageBubble from="ben">
          got it.
          <CaptureCard
            kind="note"
            state="default"
            title="Q3 strategy: reframe the positioning for ops buyers, add integration story, tighten pricing table by removing the legacy tier nobody chose since January, and sync with marketing before Monday to avoid last-minute scramble"
          />
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
