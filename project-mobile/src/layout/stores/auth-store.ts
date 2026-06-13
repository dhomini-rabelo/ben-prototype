import { create } from 'zustand'
import type { User } from '@/api/models/user'
import type { StoredUser } from '@/storage/user-storage'
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '@/storage/user-storage'
import { clearStoredToken } from '@/storage/token-storage'

function toStoredUser(user: User): StoredUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    providerId: user.providerId,
  }
}

function toUser(stored: StoredUser): User {
  return {
    id: stored.id,
    name: stored.name,
    username: stored.username,
    email: stored.email,
    avatarUrl: stored.avatarUrl,
    providerId: stored.providerId,
  }
}

interface AuthStore {
  user: User | null
  setUser: (user: User) => void
  clear: () => void
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => {
    void setStoredUser(toStoredUser(user))
    set({ user })
  },
  clear: () => {
    void clearStoredUser()
    void clearStoredToken()
    set({ user: null })
  },
  hydrate: async () => {
    const stored = await getStoredUser()
    set({ user: stored ? toUser(stored) : null })
  },
}))
