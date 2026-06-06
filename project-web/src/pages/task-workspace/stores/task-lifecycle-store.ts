import { create } from "zustand";
import {
  requestFinishTask,
  requestReopenTask,
} from "@/api/requests/tasks";
import { invalidateTask } from "./task-cache";
import { useTaskStore } from "./task-store";

interface TaskLifecycleStore {
  isMutating: boolean;
  finish: () => Promise<boolean>;
  reopen: () => Promise<void>;
  reset: () => void;
}

export const useTaskLifecycleStore = create<TaskLifecycleStore>((set) => ({
  isMutating: false,

  finish: async () => {
    const { taskId } = useTaskStore.getState();
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
    const { taskId } = useTaskStore.getState();
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

  reset: () => set({ isMutating: false }),
}));
