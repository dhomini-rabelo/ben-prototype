export type MessageRole = "user" | "ben";

export type CaptureKind = "note" | "reminder" | "task";

export interface MessageCapture {
  kind: CaptureKind;
  itemId: string;
  title: string;
  meta?: string | null;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  capture?: MessageCapture;
}
