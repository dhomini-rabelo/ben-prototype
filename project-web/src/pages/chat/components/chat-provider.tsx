import type { ReactNode } from "react";
import { ChatActionsContext } from "../contexts/chat-actions";
import { useChatController } from "../hooks/use-chat-controller";

type ChatProviderProps = {
  children: ReactNode;
};

export function ChatProvider({ children }: ChatProviderProps) {
  const actions = useChatController();

  return (
    <ChatActionsContext.Provider value={actions}>
      {children}
    </ChatActionsContext.Provider>
  );
}
