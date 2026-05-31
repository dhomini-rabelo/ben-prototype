import { useChat as useAiChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import { BASE_URL, JWT_COOKIE, PROVIDER_COOKIE } from "../../../api/client";
import type { Message } from "../../../api/models/message";
import { API_ROUTES } from "../../../api/routes";
import { useAPICursorPaginated } from "../../../layout/hooks/use-api-cursor-paginated";
import {
  type BenUiMessage,
  getMessageText,
  mapHistoryToUiMessages,
} from "../utils/chat-messages";
import { useInfiniteScrollTop } from "./use-infinite-scroll-top";

function buildChatHeaders() {
  return {
    "ngrok-skip-browser-warning": "true",
    jwtauthenticationtoken: Cookies.get(JWT_COOKIE) ?? "",
    providerauthenticationtoken: Cookies.get(PROVIDER_COOKIE) ?? "",
  };
}

export function useChat() {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<BenUiMessage>({
        api: `${BASE_URL}${API_ROUTES.chat.send}`,
        headers: buildChatHeaders,
      }),
    [],
  );

  const {
    messages: sessionMessages,
    sendMessage,
    status,
  } = useAiChat<BenUiMessage>({
    transport,
  });

  const { actions: historyActions, state: historyState } =
    useAPICursorPaginated<Message>({
      url: API_ROUTES.messages.list,
    });

  const { topRef } = useInfiniteScrollTop({
    hasMore: historyState.hasMore,
    isFetchingNextPage: historyState.isFetchingNextPage,
    onLoadMore: historyActions.fetchNextPage,
    itemCount: historyState.items.length,
  });

  const isAwaitingReply = status === "submitted" || status === "streaming";

  const historyOldestFirst = [...historyState.items].reverse();
  const messages = [
    ...mapHistoryToUiMessages(historyOldestFirst),
    ...sessionMessages,
  ];

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageLength = lastMessage
    ? getMessageText(lastMessage).length
    : 0;
  useEffect(() => {
    scrollToBottom();
  }, [lastMessageId, lastMessageLength, isAwaitingReply]);

  function handleDraftChange(value: string) {
    setDraft(value);
  }

  function handleSend() {
    const content = draft.trim();
    if (!content || isAwaitingReply) {
      return;
    }
    setDraft("");
    sendMessage({ text: content });
  }

  return {
    isLoadingHistory: historyState.isLoading,
    messages,
    draft,
    isAwaitingReply,
    isEmpty: !historyState.isLoading && messages.length === 0,
    isFetchingOlder: historyState.isFetchingNextPage,
    bottomRef,
    topRef,
    handleDraftChange,
    handleSend,
  };
}
