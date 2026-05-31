import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { JWT_COOKIE } from "../../api/client";
import { ROUTES } from "../../core/routes";
import { ActiveTaskPeek } from "./components/ActiveTaskPeek";
import { ChatEmptyState } from "./components/ChatEmptyState/ChatEmptyState";
import { ChatHistory } from "./components/ChatHistory/ChatHistory";
import { ChatHistorySkeleton } from "./components/ChatHistory/ChatHistorySkeleton";
import { ChatInput } from "./components/ChatInput/ChatInput";
import { ChatShell } from "./components/ChatShell/ChatShell";
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
      peek={
        <ActiveTaskPeek variant={chat.isLoadingHistory ? "skeleton" : "summary"} />
      }
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
          bottomRef={chat.bottomRef}
        />
      )}
    </ChatShell>
  );
}
