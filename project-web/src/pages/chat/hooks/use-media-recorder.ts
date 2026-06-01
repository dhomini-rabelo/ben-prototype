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

export function useMediaRecorder() {
  const [permission, setPermission] = useState<MicPermission>("prompt");
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setAudioBlob(null);
    setError(null);
    setElapsedSeconds(0);
  }

  async function start() {
    reset();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (caughtError) {
      if (isPermissionDeniedError(caughtError)) {
        setPermission("denied");
      } else {
        setError("Could not access the microphone.");
      }
      return;
    }

    setPermission("granted");
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
      setAudioBlob(blob);
      clearTimer();
      releaseStream();
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);
    setElapsedSeconds(0);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
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
    setIsRecording(false);
    setElapsedSeconds(0);
    setAudioBlob(null);
  }

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    function handleChange() {
      if (permissionStatus) {
        setPermission(permissionStatus.state as MicPermission);
      }
    }

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        setPermission(status.state as MicPermission);
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
    permission,
    isRecording,
    elapsedSeconds,
    audioBlob,
    error,
    start,
    stop,
    cancel,
    reset,
  };
}
