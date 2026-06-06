import { useEffect, useRef } from "react";
import { getMessageText, type BenUiMessage } from "@/pages/chat/utils/chat-messages";

interface UseScrollToBottomProps {
  messages: BenUiMessage[];
  isAwaitingReply: boolean;
}

export function useScrollToBottom({
  messages,
  isAwaitingReply,
}: UseScrollToBottomProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageLength = lastMessage ? getMessageText(lastMessage).length : 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMessageId, lastMessageLength, isAwaitingReply]);

  return { bottomRef };
}
