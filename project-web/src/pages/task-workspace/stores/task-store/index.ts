import { create } from "zustand";
import { queryClient } from "../../../../api/client";
import type { Task } from "../../../../api/models/task";
import {
  requestApproveTaskDiff,
  requestFinishTask,
  requestRejectTaskDiff,
  requestReopenTask,
  requestSendTaskMessage,
  requestUpdateTaskContent,
  requestUpdateTaskTodos,
} from "../../../../api/requests/tasks";
import { API_ROUTES } from "../../../../api/routes";
import type { ItemResponse } from "../../../../api/types";
import { useConnectivityStore } from "../../../../layout/stores/connectivity-store";
import { nextOrder } from "../../utils/todo-order";
import type { TaskStore } from "./types";

function getTaskFromCache(taskId: string): Task | null {
  const data = queryClient.getQueryData<ItemResponse<Task>>([
    API_ROUTES.tasks.detail(taskId),
    undefined,
  ]);
  return data?.item ?? null;
}

function invalidateTask(taskId: string) {
  return queryClient.invalidateQueries({
    queryKey: [API_ROUTES.tasks.detail(taskId)],
  });
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  taskId: "",
  isAwaitingReply: false,
  lastBenReply: null,
  sendError: false,
  isMutating: false,

  setTaskId: (taskId) => set({ taskId }),

  sendText: async (content) => {
    const trimmed = content.trim();
    const { taskId, isAwaitingReply } = get();
    if (
      !trimmed ||
      isAwaitingReply ||
      useConnectivityStore.getState().isOffline ||
      !taskId
    ) {
      return false;
    }

    set({ isAwaitingReply: true, sendError: false });

    try {
      const reply = await requestSendTaskMessage(taskId, trimmed);
      await invalidateTask(taskId);
      set({ lastBenReply: reply.benMessage });
      return true;
    } catch {
      set({ sendError: true });
      return false;
    } finally {
      set({ isAwaitingReply: false });
    }
  },

  approveDiff: async () => {
    const { taskId } = get();
    if (!taskId) {
      return;
    }
    set({ isMutating: true });
    try {
      await requestApproveTaskDiff(taskId);
      await invalidateTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  rejectDiff: async () => {
    const { taskId } = get();
    if (!taskId) {
      return;
    }
    set({ isMutating: true });
    try {
      await requestRejectTaskDiff(taskId);
      await invalidateTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  toggleTodo: async (itemId) => {
    const { taskId } = get();
    const todoItems = getTaskFromCache(taskId)?.todoItems;
    if (!taskId || !todoItems) {
      return;
    }
    const next = todoItems.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    );
    await requestUpdateTaskTodos(taskId, next);
    await invalidateTask(taskId);
  },

  addTodo: async (title) => {
    const trimmed = title.trim();
    const { taskId } = get();
    const todoItems = getTaskFromCache(taskId)?.todoItems;
    if (!trimmed || !taskId || !todoItems) {
      return;
    }
    const next = [
      ...todoItems,
      {
        id: crypto.randomUUID(),
        title: trimmed,
        done: false,
        order: nextOrder(todoItems),
      },
    ];
    await requestUpdateTaskTodos(taskId, next);
    await invalidateTask(taskId);
  },

  editText: async (value) => {
    const { taskId } = get();
    const task = getTaskFromCache(taskId);
    if (!taskId || value === (task?.textContent ?? "")) {
      return;
    }
    try {
      await requestUpdateTaskContent(taskId, value);
      await invalidateTask(taskId);
    } catch {
      // Swallow: text edits are best-effort, matching the other mutations'
      // no-op-on-failure behavior. (The monolith was fire-and-forget with no
      // catch at all; this adds the missing error handling.)
    }
  },

  finish: async () => {
    const { taskId } = get();
    if (!taskId) {
      return false;
    }
    set({ isMutating: true });
    try {
      await requestFinishTask(taskId);
      return true;
    } catch {
      return false;
    } finally {
      set({ isMutating: false });
    }
  },

  reopen: async () => {
    const { taskId } = get();
    if (!taskId) {
      return;
    }
    set({ isMutating: true });
    try {
      await requestReopenTask(taskId);
      await invalidateTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  reset: () =>
    set({
      isAwaitingReply: false,
      lastBenReply: null,
      sendError: false,
      isMutating: false,
    }),
}));
