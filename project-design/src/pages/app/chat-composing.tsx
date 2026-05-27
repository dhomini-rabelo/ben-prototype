import { ActiveTaskPeek } from "../../layout/components/active-task-peek";
import { CaptureCard } from "../../layout/components/capture-card";
import { ChatInput } from "../../layout/components/chat-input";
import { MessageBubble } from "../../layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function ChatComposing() {
  return (
    <ChatShell
      peek={<ActiveTaskPeek variant="summary" count={3} />}
      footer={
        <ChatInput
          mode="composing"
          value="remind me to sketch the voice-memo CLI tomorrow"
        />
      }
    >
      <section className="-mb-16 flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="user">
          what are my best projects/ideas?
        </MessageBubble>
        <MessageBubble from="ben">
          pulled from your Projects/Ideas note — top three:
          <CaptureCard
            kind="note"
            title="Projects/Ideas"
            meta="Consulted · 12 entries"
          />
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-body-md leading-snug text-on-surface">
            <li>CLI that turns voice memos into tagged notes</li>
            <li>Weekly digest of unfinished tasks, grouped by theme</li>
            <li>Tiny calendar that surfaces follow-ups from past chats</li>
          </ol>
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
