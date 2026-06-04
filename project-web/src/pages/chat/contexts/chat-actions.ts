import { createContext, useContext } from "react";
import type { ChatActions } from "../hooks/use-chat-controller";

export const ChatActionsContext = createContext<ChatActions | null>(null);

export function useChatActions(): ChatActions {
  const actions = useContext(ChatActionsContext);
  if (!actions) {
    throw new Error("useChatActions must be used within a ChatProvider");
  }
  return actions;
}
