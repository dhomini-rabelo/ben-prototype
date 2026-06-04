import type { CaptureView } from "../../../../api/responses/agent-reply";
import type { BenUiMessage } from "../../utils/chat-messages";

export function buildUserMessage(text: string): BenUiMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    parts: [{ type: "text", text }],
  };
}

export function buildBenMessage(
  text: string,
  capture?: CaptureView | null,
): BenUiMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    parts: [{ type: "text", text }],
    metadata: capture ? { capture } : undefined,
  };
}
