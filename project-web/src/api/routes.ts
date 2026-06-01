export const API_ROUTES = {
  auth: {
    loginOrRegister: "/auth/login-or-register",
  },
  messages: {
    list: "/messages/list",
  },
  chat: {
    send: "/chat",
  },
  transcription: {
    create: "/transcription",
  },
  tasks: {
    list: "/tasks/list",
    detail: (id: string) => `/tasks/${id}/detail`,
    createMessage: (id: string) => `/tasks/${id}/messages/create`,
    approveDiff: (id: string) => `/tasks/${id}/diff/approve`,
    rejectDiff: (id: string) => `/tasks/${id}/diff/reject`,
    updateContent: (id: string) => `/tasks/${id}/content/update`,
    updateTodos: (id: string) => `/tasks/${id}/todos/update`,
    finish: (id: string) => `/tasks/${id}/finish`,
    reopen: (id: string) => `/tasks/${id}/reopen`,
  },
} as const;
