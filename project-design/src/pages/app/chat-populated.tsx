import { ActiveTaskPeek } from "../../layout/components/active-task-peek";
import { CaptureCard } from "../../layout/components/capture-card/capture-card";
import { ChatInput } from "../../layout/components/chat-input";
import { MessageBubble } from "../../layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function ChatPopulated() {
  return (
    <ChatShell
      peek={
        <ActiveTaskPeek
          variant="summary"
          count={3}
          title="Draft the Q3 brief"
        />
      }
      footer={<ChatInput />}
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="ben">
          morning. what's on the list today?
        </MessageBubble>

        <MessageBubble from="user">
          remind me to pick up milk on the way home around 6
        </MessageBubble>

        <MessageBubble from="ben">
          got it — saved.
          <CaptureCard
            kind="reminder"
            title="Pick up milk on the way home"
            meta="Today · 6:00 PM"
          />
        </MessageBubble>

        <MessageBubble from="user">
          add a weekend build for a tiny CLI that turns voice memos into tagged
          notes to my project ideas note
        </MessageBubble>

        <MessageBubble from="ben">
          updated.
          <CaptureCard
            kind="note"
            title="Project Ideas"
            meta="Updated · added CLI for voice memo tagging"
          />
        </MessageBubble>

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
