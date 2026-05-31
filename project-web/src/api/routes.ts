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
} as const;
