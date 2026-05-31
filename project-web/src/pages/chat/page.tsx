import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { JWT_COOKIE } from "../../api/client";
import { ROUTES } from "../../core/routes";
import { ChatEmptyState } from "./components/chat-empty-state/chat-empty-state";
import { ChatHistory } from "./components/chat-history/chat-history";
import { ChatHistorySkeleton } from "./components/chat-history/chat-history-skeleton";
import { ChatInput } from "./components/chat-input/chat-input";
import { ChatShell } from "./components/chat-shell/chat-shell";
import { useChat } from "./hooks/use-chat";

export function Chat() {
  const navigate = useNavigate();
  const chat = useChat();

  useEffect(() => {
    if (!Cookies.get(JWT_COOKIE)) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  return (
    <ChatShell
      // peek={
      //   // <ActiveTaskPeek variant={chat.isLoadingHistory ? "skeleton" : "summary"} />
      // }
      footer={
        <ChatInput
          value={chat.draft}
          mode={chat.isLoadingHistory ? "disabled" : "idle"}
          onChange={(event) => chat.handleDraftChange(event.target.value)}
          onSend={chat.handleSend}
        />
      }
      bodyClassName={chat.isEmpty ? "px-6" : undefined}
    >
      {chat.isLoadingHistory ? (
        <ChatHistorySkeleton />
      ) : chat.isEmpty ? (
        <ChatEmptyState />
      ) : (
        <ChatHistory
          messages={chat.messages}
          isAwaitingReply={chat.isAwaitingReply}
          isFetchingOlder={chat.isFetchingOlder}
          bottomRef={chat.bottomRef}
          topRef={chat.topRef}
        />
      )}
    </ChatShell>
  );
}
