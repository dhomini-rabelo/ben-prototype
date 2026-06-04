import { useEffect, useRef } from "react";
import { requestTranscribeAudio } from "../../../api/requests/transcription";
import { useChatStore } from "../states/chat-store";
import { useMediaRecorder } from "./use-media-recorder";

interface UseVoiceInputProps {
  onTranscribed: (text: string) => void;
}

export function useVoiceInput({ onTranscribed }: UseVoiceInputProps) {
  const recorder = useMediaRecorder();
  const isOffline = useChatStore((store) => store.isOffline);
  const transcription = useChatStore((store) => store.transcription);
  const setTranscription = useChatStore((store) => store.setTranscription);
  const syncRecorder = useChatStore((store) => store.syncRecorder);

  useEffect(() => {
    syncRecorder({
      isRecording: recorder.isRecording,
      error: recorder.error,
      permission: recorder.permission,
      elapsedSeconds: recorder.elapsedSeconds,
    });
  }, [
    recorder.isRecording,
    recorder.error,
    recorder.permission,
    recorder.elapsedSeconds,
    syncRecorder,
  ]);

  const transcriptionRunIdRef = useRef(0);
  const processedBlobRef = useRef<Blob | null>(null);

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
        onTranscribed(text);
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

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    cancelTranscribing,
    retryVoice,
    dismissError,
  };
}
