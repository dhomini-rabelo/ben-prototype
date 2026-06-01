import type { MessageCapture } from "./message";

export interface ReminderDraft {
  title: string;
  remindAt?: string;
  notes?: string;
}

export interface NoteDraft {
  title: string;
  body: string;
}

export interface TaskDraft {
  title: string;
  details?: string;
}

export interface HistoryTopic {
  topic: string;
  summary: string;
}

export type CaptureView = MessageCapture;

export interface AgentReply {
  message: string;
  newReminders: ReminderDraft[];
  newNotes: NoteDraft[];
  newTasks: TaskDraft[];
  historyTopics: HistoryTopic[];
  capture: CaptureView | null;
}
