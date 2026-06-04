import { useEffect, useRef, useState } from "react";
import type { MicPermission } from "./use-microphone-permission";

const PREFERRED_MIME_TYPE = "audio/webm";

function isPermissionDeniedError(error: unknown): boolean {
  const name = (error as { name?: string }).name ?? "";
  return name === "NotAllowedError" || name === "PermissionDeniedError";
}

function resolveMimeType(): string | undefined {
  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported(PREFERRED_MIME_TYPE)
  ) {
    return PREFERRED_MIME_TYPE;
  }
  return undefined;
}

interface MediaRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
}

interface UseMediaRecorderOptions {
  onPermissionResult?: (permission: MicPermission) => void;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}) {
  const [state, setState] = useState<MediaRecorderState>({
    isRecording: false,
    audioBlob: null,
    error: null,
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onPermissionResultRef = useRef(options.onPermissionResult);

  useEffect(() => {
    onPermissionResultRef.current = options.onPermissionResult;
  });

  function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }

  function reset() {
    setState((previousState) => ({
      ...previousState,
      audioBlob: null,
      error: null,
    }));
  }

  async function start() {
    reset();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (caughtError) {
      if (isPermissionDeniedError(caughtError)) {
        onPermissionResultRef.current?.("denied");
      } else {
        setState((previousState) => ({
          ...previousState,
          error: "Could not access the microphone.",
        }));
      }
      return;
    }

    onPermissionResultRef.current?.("granted");
    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType = resolveMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      releaseStream();
      setState((previousState) => ({
        ...previousState,
        audioBlob: blob,
        isRecording: false,
      }));
    };

    recorder.start();
    setState((previousState) => ({ ...previousState, isRecording: true }));
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function cancel() {
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.onstop = null;
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }
    releaseStream();
    setState((previousState) => ({
      ...previousState,
      isRecording: false,
      audioBlob: null,
    }));
  }

  useEffect(() => {
    return () => {
      releaseStream();
    };
  }, []);

  return {
    isRecording: state.isRecording,
    audioBlob: state.audioBlob,
    error: state.error,
    start,
    stop,
    cancel,
    reset,
  };
}
