import { AlertCircle, RotateCw } from "lucide-react";
import { CaptureCard } from "../../layout/components/capture-card/capture-card";
import { ChatBanner } from "../../layout/components/chat-banner";
import { ChatInput } from "../../layout/components/chat-input";
import { MessageBubble } from "../../layout/components/message-bubble";
import { Typography } from "../../layout/components/ui/typography";
import { ChatShell } from "./_chat-shell";

export function ChatError() {
  return (
    <ChatShell
      footer={
        <>
          <ChatBanner tone="error" icon={AlertCircle} dismissible>
            mic glitched — try again or type it
          </ChatBanner>
          <ChatInput />
        </>
      }
    >
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="ben">
          got it — anything else?
        </MessageBubble>

        <MessageBubble
          from="user"
          state="error"
          footer={
            <button
              type="button"
              className="mt-1 inline-flex items-center gap-1.5 pr-2 text-text-error"
            >
              <RotateCw className="size-3.5" />
              <Typography variant="label-caps">Tap to retry</Typography>
            </button>
          }
        >
          couldn't catch that — tap to retry or type it instead
        </MessageBubble>

        <MessageBubble from="user">
          add note: review the migration plan
        </MessageBubble>

        <MessageBubble from="ben">
          saved — but couldn't sync just yet.
          <CaptureCard
            kind="note"
            title="Review the migration plan"
            state="error"
          />
        </MessageBubble>

        <MessageBubble from="ben" state="error">
          brain hiccup — give me a sec.
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 text-text-error"
          >
            <RotateCw className="size-3.5" />
            <Typography variant="label-caps">Tap to retry</Typography>
          </button>
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
