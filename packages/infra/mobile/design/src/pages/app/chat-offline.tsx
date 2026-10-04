import { CloudOff } from "lucide-react";
import { ActiveTaskPeek } from "@/layout/components/active-task-peek";
import { CaptureCard } from "@/layout/components/capture-card/capture-card";
import { ChatBanner } from "@/layout/components/chat-banner";
import { ChatInput } from "@/layout/components/chat-input";
import { MessageBubble } from "@/layout/components/message-bubble";
import { Typography } from "@/layout/components/ui/typography";
import { ChatShell } from "./_chat-shell";

export function ChatOffline() {
  return (
    <ChatShell
      topBanner={
        <ChatBanner tone="warn" icon={CloudOff} dismissible>
          offline — Ben's listening but can't reply yet
        </ChatBanner>
      }
      peek={
        <ActiveTaskPeek
          variant="summary"
          count={3}
          title="Draft the Q3 brief"
        />
      }
      footer={<ChatInput placeholder="Message Ben (queued)" />}
    >
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="ben">
          got it — saved.
          <CaptureCard
            kind="reminder"
            title="Pick up milk on the way home"
            meta="Today · 6:00 PM"
          />
        </MessageBubble>

        <MessageBubble
          from="user"
          state="pending"
          footer={
            <Typography
              variant="label-caps"
              className="pr-2 text-on-surface-variant"
            >
              Queued · sends on reconnect
            </Typography>
          }
        >
          and add a task: finalize the deck before friday
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
