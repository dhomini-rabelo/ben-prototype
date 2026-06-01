import { useChat as useAiChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import { BASE_URL, JWT_COOKIE, PROVIDER_COOKIE } from "../../../api/client";
import type { Message } from "../../../api/models/message";
import { API_ROUTES } from "../../../api/routes";
import { transcribeAudio } from "../../../api/transcription";
import { useAPICursorPaginated } from "../../../layout/hooks/use-api-cursor-paginated";
import {
  type BenUiMessage,
  getMessageText,
  mapHistoryToUiMessages,
} from "../utils/chat-messages";
import { useConnectivity } from "./use-connectivity";
import { useInfiniteScrollTop } from "./use-infinite-scroll-top";
import { useMediaRecorder } from "./use-media-recorder";

type VoiceStatus = "idle" | "recording" | "transcribing" | "error";

function buildChatHeaders() {
  return {
    "ngrok-skip-browser-warning": "true",
    jwtauthenticationtoken: Cookies.get(JWT_COOKIE) ?? "",
    providerauthenticationtoken: Cookies.get(PROVIDER_COOKIE) ?? "",
  };
}

export function useChat() {
  const [draft, setDraft] = useState("");
  const [transcription, setTranscription] = useState<
    "idle" | "pending" | "error"
  >("idle");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const transcriptionRunIdRef = useRef(0);
  const processedBlobRef = useRef<Blob | null>(null);

  const recorder = useMediaRecorder();
  const { isOffline } = useConnectivity();

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

  function sendText(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isAwaitingReply || isOffline) {
      return;
    }
    sendMessage({ text: trimmed });
  }

  function handleSend() {
    sendText(draft);
    setDraft("");
  }

  async function startRecording() {
    if (recorder.permission === "denied" || isOffline) {
      return;
    }
    setTranscription("idle");
    await recorder.start();
  }

  function stopRecording() {
    setTranscription("pending");
    recorder.stop();
  }

  function cancelRecording() {
    recorder.cancel();
    setTranscription("idle");
  }

  function cancelTranscribing() {
    transcriptionRunIdRef.current += 1;
    recorder.reset();
    setTranscription("idle");
  }

  function retryVoice() {
    setTranscription("idle");
    void startRecording();
  }

  function dismissError() {
    recorder.reset();
    setTranscription("idle");
  }

  // Start transcription once the recorder has produced a clip. State is only
  // mutated inside the async callbacks (never synchronously in the effect body),
  // so this does not trigger cascading renders.
  useEffect(() => {
    if (transcription !== "pending") {
      return;
    }
    const blob = recorder.audioBlob;
    if (!blob || processedBlobRef.current === blob) {
      return;
    }
    processedBlobRef.current = blob;
    const runId = transcriptionRunIdRef.current + 1;
    transcriptionRunIdRef.current = runId;

    transcribeAudio(blob)
      .then(({ text }) => {
        if (transcriptionRunIdRef.current !== runId) {
          return;
        }
        sendText(text);
        recorder.reset();
        setTranscription("idle");
      })
      .catch(() => {
        if (transcriptionRunIdRef.current !== runId) {
          return;
        }
        setTranscription("error");
      });
  }, [transcription, recorder.audioBlob]);

  // Derive the voice status from the recorder + transcription sub-state so the
  // effects above never need to set it synchronously.
  let voiceStatus: VoiceStatus = "idle";
  if (recorder.isRecording) {
    voiceStatus = "recording";
  } else if (transcription === "pending") {
    voiceStatus = "transcribing";
  } else if (transcription === "error" || recorder.error) {
    voiceStatus = "error";
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
    voiceStatus,
    isOffline,
    micPermission: recorder.permission,
    recordingSeconds: recorder.elapsedSeconds,
    canRecord: recorder.permission !== "denied" && !isOffline,
    startRecording,
    stopRecording,
    cancelRecording,
    cancelTranscribing,
    retryVoice,
    dismissError,
  };
}
