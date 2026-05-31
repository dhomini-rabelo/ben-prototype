import type { RefObject } from "react";
import { Typography } from "../../../../layout/components/ui/typography";
import {
  getMessageText,
  type BenUiMessage,
} from "../../utils/chat-messages";
import { CaptureCard } from "../capture-card/capture-card";
import { MessageBubble } from "../message-bubble/message-bubble";
import { TypingIndicator } from "../typing-indicator";

type ChatHistoryProps = {
  messages: BenUiMessage[];
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

      {messages.map((message) => {
        const text = getMessageText(message);
        const isBen = message.role === "assistant";
        const capture = message.metadata?.capture;
        return (
          <MessageBubble key={message.id} from={isBen ? "ben" : "user"}>
            {text}
            {isBen && capture && (
              <CaptureCard kind={capture.kind} title={text} />
            )}
          </MessageBubble>
        );
      })}

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
