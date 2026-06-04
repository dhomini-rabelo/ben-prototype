import type { MicPermission } from "./types";

const PREFERRED_MIME_TYPE = "audio/webm";

interface RecorderCallbacks {
  onPermission: (permission: MicPermission) => void;
  onError: (message: string) => void;
  onStop: (blob: Blob) => void;
}

let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let chunks: Blob[] = [];

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

export function releaseRecorder() {
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  recorder = null;
  chunks = [];
}

export async function startRecorder(
  callbacks: RecorderCallbacks,
): Promise<boolean> {
  let mediaStream: MediaStream;
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (caughtError) {
    if (isPermissionDeniedError(caughtError)) {
      callbacks.onPermission("denied");
    } else {
      callbacks.onError("Could not access the microphone.");
    }
    return false;
  }

  callbacks.onPermission("granted");
  stream = mediaStream;
  chunks = [];

  const mimeType = resolveMimeType();
  const mediaRecorder = mimeType
    ? new MediaRecorder(mediaStream, { mimeType })
    : new MediaRecorder(mediaStream);
  recorder = mediaRecorder;

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
    releaseRecorder();
    callbacks.onStop(blob);
  };

  mediaRecorder.start();
  return true;
}

export function stopRecorder() {
  if (recorder?.state === "recording") {
    recorder.stop();
  }
}

export function cancelRecorder() {
  if (recorder) {
    recorder.onstop = null;
    if (recorder.state === "recording") {
      recorder.stop();
    }
  }
  releaseRecorder();
}
