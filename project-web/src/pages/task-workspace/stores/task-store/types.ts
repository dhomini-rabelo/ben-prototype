export interface TaskStore {
  taskId: string;
  isAwaitingReply: boolean;
  lastBenReply: string | null;
  sendError: boolean;
  isMutating: boolean;

  setTaskId: (taskId: string) => void;
  sendText: (content: string) => Promise<boolean>;
  approveDiff: () => Promise<void>;
  rejectDiff: () => Promise<void>;
  toggleTodo: (itemId: string) => Promise<void>;
  addTodo: (title: string) => Promise<void>;
  editText: (value: string) => Promise<void>;
  finish: () => Promise<boolean>;
  reopen: () => Promise<void>;
  reset: () => void;
}
