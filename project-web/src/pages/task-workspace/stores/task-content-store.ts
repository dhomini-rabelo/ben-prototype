import { create } from "zustand";
import { requestUpdateTaskContent } from "../../../api/requests/tasks";
import { getTaskFromCache, invalidateTask } from "./task-cache";
import { useTaskStore } from "./task-store";

interface TaskContentStore {
  editText: (value: string) => Promise<void>;
}

export const useTaskContentStore = create<TaskContentStore>(() => ({
  editText: async (value) => {
    const { taskId } = useTaskStore.getState();
    const task = getTaskFromCache(taskId);
    if (!taskId || value === (task?.textContent ?? "")) {
      return;
    }
    try {
      await requestUpdateTaskContent(taskId, value);
      await invalidateTask(taskId);
    } catch {
      // Swallow: text edits are best-effort, matching the other mutations'
      // no-op-on-failure behavior.
    }
  },
}));
