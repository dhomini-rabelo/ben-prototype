import { MessageBubble } from "@/layout/components/chat/message-bubble";
import { RecordingBar } from "@/layout/components/chat/recording-bar";
import { ChatShell } from "@/layout/components/common/chat-shell";

export function ChatRecordingPage() {
  return (
    <div className="relative">
      <ChatShell footer={<RecordingBar />}>
        <section className="flex flex-1 flex-col justify-end gap-4 pt-2 opacity-40">
          <MessageBubble from="ben">morning. what's on the list today?</MessageBubble>
          <MessageBubble from="user">
            remind me to pick up milk on the way home
          </MessageBubble>
          <MessageBubble from="ben">got it — saved.</MessageBubble>
        </section>
      </ChatShell>
      <div className="pointer-events-none fixed inset-0 z-40 bg-on-surface/10" />
    </div>
  );
}
