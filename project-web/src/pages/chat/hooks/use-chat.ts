import { useEffect, useRef, useState } from "react";
import type { CaptureView } from "../../../api/responses/agent-reply";
import { requestSendChatMessage } from "../../../api/requests/chat";
import { requestTranscribeAudio } from "../../../api/requests/transcription";
import { useMessageListData } from "../../../layout/hooks/api/use-message-list-data";
import {
  type BenUiMessage,
  getMessageText,
  mapHistoryToUiMessages,
} from "../utils/chat-messages";
import { useConnectivity } from "./use-connectivity";
import { useInfiniteScrollTop } from "./use-infinite-scroll-top";
import { useMediaRecorder } from "./use-media-recorder";

type VoiceStatus = "idle" | "recording" | "transcribing" | "error";

const TYPING_STEP_MS = 24;
const TYPING_CHARS_PER_STEP = 3;

function buildUserMessage(text: string): BenUiMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    parts: [{ type: "text", text }],
  };
}

function buildBenMessage(
  text: string,
  capture?: CaptureView | null,
): BenUiMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    parts: [{ type: "text", text }],
    metadata: capture ? { capture } : undefined,
  };
}

export function useChat() {
  const [draft, setDraft] = useState("");
  const [sessionMessages, setSessionMessages] = useState<BenUiMessage[]>([]);
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [transcription, setTranscription] = useState<
    "idle" | "pending" | "error"
  >("idle");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const transcriptionRunIdRef = useRef(0);
  const processedBlobRef = useRef<Blob | null>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useMediaRecorder();
  const { isOffline } = useConnectivity();

  const { actions: historyActions, state: historyState } = useMessageListData();

  const { topRef } = useInfiniteScrollTop({
    hasMore: historyState.hasMore,
    isFetchingNextPage: historyState.isFetchingNextPage,
    onLoadMore: historyActions.fetchNextPage,
    itemCount: historyState.items.length,
  });

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

  function stopTyping() {
    if (typingIntervalRef.current !== null) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }

  useEffect(() => stopTyping, []);

  function animateBenReply(messageId: string, fullText: string) {
    stopTyping();
    let revealed = 0;
    typingIntervalRef.current = setInterval(() => {
      revealed = Math.min(revealed + TYPING_CHARS_PER_STEP, fullText.length);
      const nextText = fullText.slice(0, revealed);
      setSessionMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? { ...message, parts: [{ type: "text", text: nextText }] }
            : message,
        ),
      );
      if (revealed >= fullText.length) {
        stopTyping();
      }
    }, TYPING_STEP_MS);
  }

  function handleDraftChange(value: string) {
    setDraft(value);
  }

  async function sendText(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isAwaitingReply || isOffline) {
      return;
    }

    setSendError(false);
    stopTyping();
    setSessionMessages((current) => [...current, buildUserMessage(trimmed)]);
    setIsAwaitingReply(true);

    try {
      const reply = await requestSendChatMessage(trimmed);
      const benMessage = buildBenMessage("", reply.capture);
      setSessionMessages((current) => [...current, benMessage]);
      animateBenReply(benMessage.id, reply.message);
    } catch {
      setSendError(true);
    } finally {
      setIsAwaitingReply(false);
    }
  }

  function handleSend() {
    void sendText(draft);
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

    requestTranscribeAudio(blob)
      .then(({ text }) => {
        if (transcriptionRunIdRef.current !== runId) {
          return;
        }
        void sendText(text);
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
    sendError,
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
