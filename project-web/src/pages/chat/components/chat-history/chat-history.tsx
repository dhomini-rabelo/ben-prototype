import type { RefObject } from "react";
import { Typography } from "../../../../layout/components/ui/typography";
import type { Message } from "../../../../api/models/message";
import { CaptureCard } from "../capture-card/capture-card";
import { MessageBubble } from "../message-bubble/message-bubble";
import { TypingIndicator } from "../typing-indicator";

type ChatHistoryProps = {
  messages: Message[];
  isAwaitingReply: boolean;
  isFetchingOlder: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  topRef: RefObject<HTMLDivElement | null>;
};

export function ChatHistory({
  messages,
  isAwaitingReply,
  isFetchingOlder,
  bottomRef,
  topRef,
}: ChatHistoryProps) {
  return (
    <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
      <div ref={topRef} />

      {isFetchingOlder && (
        <div className="flex w-full justify-center py-2">
          <TypingIndicator />
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} from={message.role}>
          {message.content}
          {message.role === "ben" && message.capture && (
            <CaptureCard
              kind={message.capture.kind}
              title={message.content}
            />
          )}
        </MessageBubble>
      ))}

      {isAwaitingReply && (
        <div className="flex w-full justify-start">
          <div className="flex flex-col items-start gap-1">
            <div className="ml-1">
              <Typography
                variant="label-caps"
                className="text-on-surface-variant"
              >
                Ben
              </Typography>
            </div>
            <TypingIndicator />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
}
