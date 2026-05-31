import type { UIMessage } from "ai";
import type { Message, MessageCapture } from "../../../api/models/message";

export type BenMessageMetadata = {
  capture?: MessageCapture;
};

export type BenUiMessage = UIMessage<BenMessageMetadata>;

export function mapHistoryToUiMessages(history: Message[]): BenUiMessage[] {
  return history.map((message) => ({
    id: message.id,
    role: message.role === "ben" ? "assistant" : "user",
    parts: [{ type: "text", text: message.content }],
    metadata: message.capture ? { capture: message.capture } : undefined,
  }));
}

export function getMessageText(message: BenUiMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
