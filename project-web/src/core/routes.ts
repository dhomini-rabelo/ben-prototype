export const ROUTES = {
  login: "/",
  chat: "/chat",
  taskWorkspace: (taskId = ":taskId") => `/tasks/${taskId}`,
} as const;
