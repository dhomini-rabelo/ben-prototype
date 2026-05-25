import { X } from "lucide-react";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { LedgerPeek } from "../../layout/components/ui/ledger-peek";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { Typography } from "../../layout/components/ui/typography";
import { ChatShell } from "./_chat-shell";

export function ChatTranscribing() {
  return (
    <ChatShell
      footer={
        <>
          <LedgerPeek
            variant="up-next"
            title="Pick up milk on the way home"
            meta="in 2h"
          />
          <ChatInput mode="sending-disabled" />
        </>
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="ben">
          got it — anything else for today?
        </MessageBubble>

        <MessageBubble
          from="user"
          state="pending"
          footer={
            <div className="flex items-center gap-1.5 pr-2">
              <Typography
                variant="label-caps"
                className="text-on-surface-variant"
              >
                Hearing you
              </Typography>
              <span className="flex items-center gap-0.5">
                <span className="size-1 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.2s]" />
                <span className="size-1 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.1s]" />
                <span className="size-1 animate-bounce rounded-full bg-on-surface-variant" />
              </span>
              <button
                aria-label="Cancel transcription"
                className="ml-1 flex size-4 items-center justify-center rounded-full text-on-surface-variant hover:text-text-error"
              >
                <X className="size-3" />
              </button>
            </div>
          }
        >
          <span className="italic text-on-primary/70">…</span>
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
