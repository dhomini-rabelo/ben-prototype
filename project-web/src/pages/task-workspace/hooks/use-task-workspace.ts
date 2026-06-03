import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Task, TodoItem } from "../../../api/models/task";
import {
    requestApproveTaskDiff,
    requestFinishTask,
    requestRejectTaskDiff,
    requestReopenTask,
    requestSendTaskMessage,
    requestUpdateTaskContent,
    requestUpdateTaskTodos,
} from "../../../api/requests/tasks";
import { requestTranscribeAudio } from "../../../api/requests/transcription";
import { API_ROUTES } from "../../../api/routes";
import type { ItemResponse } from "../../../api/types";
import { ROUTES } from "../../../core/routes";
import { useAPIRequest } from "../../../layout/hooks/use-api-request";
import { useConnectivity } from "../../chat/hooks/use-connectivity";
import { useMediaRecorder } from "../../chat/hooks/use-media-recorder";

type VoiceStatus = "idle" | "recording" | "transcribing" | "error";

interface WorkspaceState {
  taskOverride: Task | null;
  draft: string;
  isAwaitingReply: boolean;
  lastBenReply: string | null;
  sendError: boolean;
  isMutating: boolean;
}

function nextOrder(todoItems: TodoItem[]): number {
  return todoItems.reduce((max, item) => Math.max(max, item.order), -1) + 1;
}

export function useTaskWorkspace() {
  const navigate = useNavigate();
  const { taskId = "" } = useParams<{ taskId: string }>();

  const [state, setState] = useState<WorkspaceState>({
    taskOverride: null,
    draft: "",
    isAwaitingReply: false,
    lastBenReply: null,
    sendError: false,
    isMutating: false,
  });

  const [transcription, setTranscription] = useState<
    "idle" | "pending" | "error"
  >("idle");
  const transcriptionRunIdRef = useRef(0);
  const processedBlobRef = useRef<Blob | null>(null);

  const recorder = useMediaRecorder();
  const { isOffline } = useConnectivity();

  const { actions: detailActions, state: detailState } = useAPIRequest<
    ItemResponse<Task>
  >({
    url: API_ROUTES.tasks.detail(taskId),
  });

  const task = state.taskOverride ?? detailState.data?.item ?? null;

  function setTask(updated: Task) {
    setState((current) => ({ ...current, taskOverride: updated }));
  }

  async function sendMessageText(content: string) {
    const trimmed = content.trim();
    if (!trimmed || state.isAwaitingReply || isOffline || !taskId) {
      return;
    }

    setState((current) => ({
      ...current,
      isAwaitingReply: true,
      sendError: false,
    }));

    try {
      const reply = await requestSendTaskMessage(taskId, trimmed);
      setState((current) => ({
        ...current,
        taskOverride: reply.task,
        lastBenReply: reply.benMessage,
      }));
    } catch {
      setState((current) => ({ ...current, sendError: true }));
    } finally {
      setState((current) => ({ ...current, isAwaitingReply: false }));
    }
  }

  function handleDraftChange(value: string) {
    setState((current) => ({ ...current, draft: value }));
  }

  function handleSend() {
    void sendMessageText(state.draft);
    setState((current) => ({ ...current, draft: "" }));
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

  async function handleApproveDiff() {
    if (!taskId) {
      return;
    }
    setState((current) => ({ ...current, isMutating: true }));
    try {
      setTask(await requestApproveTaskDiff(taskId));
    } finally {
      setState((current) => ({ ...current, isMutating: false }));
    }
  }

  async function handleRejectDiff() {
    if (!taskId) {
      return;
    }
    setState((current) => ({ ...current, isMutating: true }));
    try {
      setTask(await requestRejectTaskDiff(taskId));
    } finally {
      setState((current) => ({ ...current, isMutating: false }));
    }
  }

  async function persistTodos(todoItems: TodoItem[]) {
    if (!taskId) {
      return;
    }
    setTask(await requestUpdateTaskTodos(taskId, todoItems));
  }

  function handleToggleTodo(itemId: string) {
    const todoItems = task?.todoItems;
    if (!todoItems) {
      return;
    }
    void persistTodos(
      todoItems.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      ),
    );
  }

  function handleAddTodo(title: string) {
    const trimmed = title.trim();
    const todoItems = task?.todoItems;
    if (!trimmed || !todoItems) {
      return;
    }
    void persistTodos([
      ...todoItems,
      {
        id: crypto.randomUUID(),
        title: trimmed,
        done: false,
        order: nextOrder(todoItems),
      },
    ]);
  }

  function handleTextEdit(value: string) {
    if (!taskId || value === (task?.textContent ?? "")) {
      return;
    }
    void requestUpdateTaskContent(taskId, value).then(setTask);
  }

  async function handleFinish() {
    if (!taskId) {
      return;
    }
    setState((current) => ({ ...current, isMutating: true }));
    try {
      await requestFinishTask(taskId);
      navigate(ROUTES.chat);
    } finally {
      setState((current) => ({ ...current, isMutating: false }));
    }
  }

  async function handleReopen() {
    if (!taskId) {
      return;
    }
    setState((current) => ({ ...current, isMutating: true }));
    try {
      setTask(await requestReopenTask(taskId));
    } finally {
      setState((current) => ({ ...current, isMutating: false }));
    }
  }

  function handleBack() {
    navigate(ROUTES.chat);
  }

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
        void sendMessageText(text);
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

  let voiceStatus: VoiceStatus = "idle";
  if (recorder.isRecording) {
    voiceStatus = "recording";
  } else if (transcription === "pending") {
    voiceStatus = "transcribing";
  } else if (transcription === "error" || recorder.error) {
    voiceStatus = "error";
  }

  return {
    task,
    isLoading: detailState.isLoading,
    isError: detailState.isError,
    retry: detailActions.refetch,
    draft: state.draft,
    isAwaitingReply: state.isAwaitingReply,
    lastBenReply: state.lastBenReply,
    sendError: state.sendError,
    isMutating: state.isMutating,
    voiceStatus,
    isOffline,
    micPermission: recorder.permission,
    recordingSeconds: recorder.elapsedSeconds,
    canRecord: recorder.permission !== "denied" && !isOffline,
    handleDraftChange,
    handleSend,
    startRecording,
    stopRecording,
    cancelRecording,
    cancelTranscribing,
    retryVoice,
    dismissError,
    handleApproveDiff,
    handleRejectDiff,
    handleToggleTodo,
    handleAddTodo,
    handleTextEdit,
    handleFinish,
    handleReopen,
    handleBack,
  };
}
