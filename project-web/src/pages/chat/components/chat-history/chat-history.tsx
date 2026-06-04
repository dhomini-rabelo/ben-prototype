import { Link } from "react-router";
import { ROUTES } from "../../../../core/routes";
import { Typography } from "../../../../layout/components/ui/typography";
import { useChatMessages } from "../../hooks/use-chat-messages";
import { useInfiniteScrollTop } from "../../hooks/use-infinite-scroll-top";
import { useScrollToBottom } from "../../hooks/use-scroll-to-bottom";
import { useMessagesStore } from "../../stores/messages-store";
import { selectVoiceStatus, useVoiceStore } from "../../../../layout/stores/voice-store";
import { getMessageText } from "../../utils/chat-messages";
import { CaptureCard } from "../capture-card";
import { MessageBubble } from "../message-bubble/message-bubble";
import { RetryFooter } from "../message-footers/retry-footer";
import { TranscribingFooter } from "../message-footers/transcribing-footer";
import { TypingIndicator } from "../typing-indicator";

export function ChatHistory() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const isAwaitingReply = useMessagesStore((store) => store.isAwaitingReply);

  const { messages, historyState, historyActions } = useChatMessages();

  const { bottomRef } = useScrollToBottom({ messages, isAwaitingReply });
  const { topRef } = useInfiniteScrollTop({
    hasMore: historyState.hasMore,
    isFetchingNextPage: historyState.isFetchingNextPage,
    onLoadMore: historyActions.fetchNextPage,
    itemCount: historyState.items.length,
  });

  return (
    <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
      <div ref={topRef} />

      {historyState.isFetchingNextPage && (
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
              <CaptureCard.Root kind={capture.kind}>
                <CaptureCard.Icon />
                <CaptureCard.Body>
                  <CaptureCard.Header />
                  <CaptureCard.Title>{capture.title}</CaptureCard.Title>
                  {capture.meta && (
                    <CaptureCard.Meta>{capture.meta}</CaptureCard.Meta>
                  )}
                  <Link to={ROUTES.taskWorkspace(capture.itemId)}>
                    <CaptureCard.Action />
                  </Link>
                </CaptureCard.Body>
              </CaptureCard.Root>
            )}
          </MessageBubble>
        );
      })}

      {voiceStatus === "transcribing" && (
        <MessageBubble
          from="user"
          state="pending"
          footer={<TranscribingFooter />}
        >
          <span className="italic text-on-primary/70">…</span>
        </MessageBubble>
      )}

      {voiceStatus === "error" && (
        <MessageBubble from="user" state="error" footer={<RetryFooter />}>
          couldn't catch that — tap to retry or type it instead
        </MessageBubble>
      )}

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
