import type { UIMessage } from "ai";
import type { MessageCapture } from "@/api/models/message";

export type BenMessageMetadata = {
  capture?: MessageCapture;
};

export type BenUiMessage = UIMessage<BenMessageMetadata>;

export function getMessageText(message: BenUiMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
