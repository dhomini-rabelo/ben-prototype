export const ROUTES = {
  login: "/",
  chat: "/chat",
  taskWorkspace: "/tasks/:taskId",
} as const;

export function buildTaskWorkspacePath(taskId: string): string {
  return `/tasks/${taskId}`;
}
