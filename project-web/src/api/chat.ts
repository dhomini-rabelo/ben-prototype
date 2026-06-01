import { authClient } from "./client";
import type { AgentReply } from "./models/agent-reply";
import { API_ROUTES } from "./routes";

export async function sendChatMessage(text: string): Promise<AgentReply> {
  const response = await authClient.post<AgentReply>(API_ROUTES.chat.send, {
    messages: [{ role: "user", parts: [{ type: "text", text }] }],
  });

  return response.data;
}
