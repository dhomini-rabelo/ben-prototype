import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ChatComposer } from "../../layout/components/ui/chat-composer";
import { LedgerPeek } from "../../layout/components/ui/ledger-peek";
import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { TypingIndicator } from "../../layout/components/ui/typing-indicator";
import { ChatShell } from "./_chat-shell";

export function ChatEdgeCases() {
  return (
    <ChatShell
      footer={
        <>
          <LedgerPeek
            variant="summary"
            title="12 notes · 4 tasks · 1 reminder"
          />
          <ChatComposer />
        </>
      }
    >
      <section className="flex flex-1 flex-col gap-4 pt-2">
        <MessageBubble from="ben">
          you're rolling — what else?
        </MessageBubble>

        <MessageBubble from="user">
          ok so big brain dump — the q3 brief needs three things: a clearer
          positioning paragraph at the top (right now it reads like we're
          selling to engineers but the buyer is a head of ops), a section on
          the integration story with the existing tools the team already uses
          daily, and finally a tightened pricing table that removes the legacy
          tier nobody's chosen since january. also rope in marketing before
          monday so we don't have a last minute scramble.
        </MessageBubble>

        <MessageBubble from="ben">
          parsed — let me split that up.
          <CaptureCard
            kind="task"
            title="Rewrite Q3 brief positioning for head-of-ops buyer"
            meta="Due Fri · 2026-05-29"
          />
          <CaptureCard
            kind="task"
            title="Add integration-story section to Q3 brief"
            meta="Due Fri · 2026-05-29"
          />
          <CaptureCard
            kind="task"
            title="Tighten pricing table — drop legacy tier"
            meta="Due Fri · 2026-05-29"
          />
          <CaptureCard
            kind="reminder"
            title="Loop in marketing on Q3 brief"
            meta="Mon · 9:00 AM"
          />
        </MessageBubble>

        <MessageBubble from="user">also note: try the 1:16 pour-over</MessageBubble>
        <MessageBubble from="user">and remind me to call mom sunday</MessageBubble>

        <div className="flex w-full justify-start">
          <TypingIndicator />
        </div>
      </section>
    </ChatShell>
  );
}
