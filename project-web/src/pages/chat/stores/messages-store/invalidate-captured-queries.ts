import { queryClient } from "@/api/client";
import type { CaptureKind } from "@/api/models/message";
import { API_ROUTES } from "@/api/routes";
import type { AgentReply } from "@/api/responses/agent-reply";

const LIST_ROUTE_BY_KIND: Record<CaptureKind, string> = {
  note: API_ROUTES.notes.list,
  task: API_ROUTES.tasks.list,
  reminder: API_ROUTES.reminders.list,
};

export function invalidateCapturedQueries(reply: AgentReply) {
  const capturedKinds = new Set<CaptureKind>();

  if (reply.newNotes.length > 0) capturedKinds.add("note");
  if (reply.newTasks.length > 0) capturedKinds.add("task");
  if (reply.newReminders.length > 0) capturedKinds.add("reminder");
  if (reply.capture) capturedKinds.add(reply.capture.kind);

  if (capturedKinds.size === 0) return;

  for (const kind of capturedKinds) {
    queryClient.invalidateQueries({ queryKey: [LIST_ROUTE_BY_KIND[kind]] });
  }

  queryClient.invalidateQueries({ queryKey: [API_ROUTES.captures.counts] });
}
