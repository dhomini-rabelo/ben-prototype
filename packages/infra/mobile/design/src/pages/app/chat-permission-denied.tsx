import { MicOff } from "lucide-react";
import { ChatBanner } from "@/layout/components/chat-banner";
import { ChatInput } from "@/layout/components/chat-input";
import { MessageBubble } from "@/layout/components/message-bubble";
import { ChatShell } from "./_chat-shell";

export function ChatPermissionDenied() {
  return (
    <ChatShell
      footer={
        <>
          <ChatBanner
            tone="warn"
            icon={MicOff}
            action={{ label: "Show me how" }}
            dismissible
          >
            Ben can't hear you yet — turn on mic in browser settings.
          </ChatBanner>
          <ChatInput placeholder="Type — text works without mic" />
        </>
      }
    >
      <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
        <MessageBubble from="ben">
          morning. what's on the list today?
        </MessageBubble>
        <MessageBubble from="user">
          actually, type works fine for now
        </MessageBubble>
        <MessageBubble from="ben">
          all good — type whenever, the mic's there when you want it.
        </MessageBubble>
      </section>
    </ChatShell>
  );
}
