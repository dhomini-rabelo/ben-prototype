import Cookies from "js-cookie";
import { create } from "zustand";
import type { User } from "@/api/models/user";

export const USER_COOKIE = "@ben/user";

function readStoredUser(): User | null {
  const raw = Cookies.get(USER_COOKIE);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: readStoredUser(),
  setUser: (user) => {
    Cookies.set(USER_COOKIE, JSON.stringify(user), { expires: 5 });
    set({ user });
  },
  clear: () => {
    Cookies.remove(USER_COOKIE);
    set({ user: null });
  },
}));
