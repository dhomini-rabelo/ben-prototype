const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string

export const API_ROUTES = {
  auth: {
    loginOrRegister: `${BACKEND_URL}/auth/login-or-register`,
  },
}