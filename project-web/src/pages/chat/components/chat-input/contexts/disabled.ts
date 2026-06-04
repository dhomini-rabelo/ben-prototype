import { createContext, useContext } from "react";

export const ChatInputDisabledContext = createContext<boolean>(false);

export function useChatInputDisabled() {
  return useContext(ChatInputDisabledContext);
}
