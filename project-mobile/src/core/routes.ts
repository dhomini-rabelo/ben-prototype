export const ROUTES = {
  login: '/',
  chat: '/chat',
  menu: '/menu',
  taskWorkspace: (taskId = '[taskId]') => `/tasks/${taskId}`,
} as const
