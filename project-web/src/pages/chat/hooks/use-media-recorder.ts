import { useEffect, useRef, useState } from "react";

export type MicPermission = "granted" | "denied" | "prompt";

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
  permission: MicPermission;
  isRecording: boolean;
  elapsedSeconds: number;
  audioBlob: Blob | null;
  error: string | null;
}

export function useMediaRecorder() {
  const [state, setState] = useState<MediaRecorderState>({
    permission: "prompt",
    isRecording: false,
    elapsedSeconds: 0,
    audioBlob: null,
    error: null,
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimer() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

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
      elapsedSeconds: 0,
    }));
  }

  async function start() {
    reset();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (caughtError) {
      if (isPermissionDeniedError(caughtError)) {
        setState((previousState) => ({ ...previousState, permission: "denied" }));
      } else {
        setState((previousState) => ({
          ...previousState,
          error: "Could not access the microphone.",
        }));
      }
      return;
    }

    setState((previousState) => ({ ...previousState, permission: "granted" }));
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
      clearTimer();
      releaseStream();
      setState((previousState) => ({
        ...previousState,
        audioBlob: blob,
        isRecording: false,
      }));
    };

    recorder.start();
    setState((previousState) => ({
      ...previousState,
      isRecording: true,
      elapsedSeconds: 0,
    }));
    intervalRef.current = setInterval(() => {
      setState((previousState) => ({
        ...previousState,
        elapsedSeconds: previousState.elapsedSeconds + 1,
      }));
    }, 1000);
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
    clearTimer();
    releaseStream();
    setState((previousState) => ({
      ...previousState,
      isRecording: false,
      elapsedSeconds: 0,
      audioBlob: null,
    }));
  }

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    function handleChange() {
      if (permissionStatus) {
        const nextState = permissionStatus.state as MicPermission;
        setState((previousState) => ({ ...previousState, permission: nextState }));
      }
    }

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        setState((previousState) => ({
          ...previousState,
          permission: status.state as MicPermission,
        }));
        status.addEventListener("change", handleChange);
      })
      .catch(() => undefined);

    return () => {
      permissionStatus?.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      releaseStream();
    };
  }, []);

  return {
    permission: state.permission,
    isRecording: state.isRecording,
    elapsedSeconds: state.elapsedSeconds,
    audioBlob: state.audioBlob,
    error: state.error,
    start,
    stop,
    cancel,
    reset,
  };
}
