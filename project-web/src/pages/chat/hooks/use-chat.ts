import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { authClient } from "../../../api/client";
import type {
  CreateMessageRequestData,
  CreateMessageResponseData,
} from "../../../api/contracts/message";
import type { Message } from "../../../api/models/message";
import { API_ROUTES } from "../../../api/routes";
import { useAPICursorPaginated } from "../../../layout/hooks/use-api-cursor-paginated";

interface ChatLocalState {
  draft: string;
  pendingMessages: Message[];
  sessionMessages: Message[];
  isAwaitingReply: boolean;
}

const INITIAL_STATE: ChatLocalState = {
  draft: "",
  pendingMessages: [],
  sessionMessages: [],
  isAwaitingReply: false,
};

export function useChat() {
  const [state, setState] = useState<ChatLocalState>(INITIAL_STATE);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { state: historyState } = useAPICursorPaginated<Message>({
    url: API_ROUTES.messages.list,
  });

  const createMessageMutation = useMutation({
    mutationFn: async (request: CreateMessageRequestData) => {
      const response = await authClient.post<CreateMessageResponseData>(
        API_ROUTES.messages.create,
        request,
      );
      return response.data;
    },
  });

  const historyOldestFirst = [...historyState.items].reverse();
  const messages = [
    ...historyOldestFirst,
    ...state.sessionMessages,
    ...state.pendingMessages,
  ];

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, state.isAwaitingReply]);

  function handleDraftChange(value: string) {
    setState((previous) => ({ ...previous, draft: value }));
  }

  async function handleSend() {
    const content = state.draft.trim();
    if (!content || state.isAwaitingReply) {
      return;
    }

    const optimisticUserMessage: Message = {
      id: `pending-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setState((previous) => ({
      ...previous,
      draft: "",
      isAwaitingReply: true,
      pendingMessages: [...previous.pendingMessages, optimisticUserMessage],
    }));

    try {
      const response = await createMessageMutation.mutateAsync({ content });
      const benMessage = response.capture
        ? { ...response.benMessage, capture: response.capture }
        : response.benMessage;

      setState((previous) => ({
        ...previous,
        isAwaitingReply: false,
        pendingMessages: previous.pendingMessages.filter(
          (message) => message.id !== optimisticUserMessage.id,
        ),
        sessionMessages: [
          ...previous.sessionMessages,
          response.userMessage,
          benMessage,
        ],
      }));
    } catch {
      setState((previous) => ({
        ...previous,
        isAwaitingReply: false,
        pendingMessages: previous.pendingMessages.filter(
          (message) => message.id !== optimisticUserMessage.id,
        ),
      }));
    }
  }

  return {
    isLoadingHistory: historyState.isLoading,
    messages,
    draft: state.draft,
    isAwaitingReply: state.isAwaitingReply,
    isEmpty: !historyState.isLoading && messages.length === 0,
    bottomRef,
    handleDraftChange,
    handleSend,
  };
}
