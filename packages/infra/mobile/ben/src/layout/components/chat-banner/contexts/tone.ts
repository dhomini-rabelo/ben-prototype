import { createContext, useContext } from 'react'

export type ChatBannerTone = 'info' | 'warn' | 'error'

export const ChatBannerToneContext = createContext<ChatBannerTone>('info')

export function useChatBannerTone() {
  return useContext(ChatBannerToneContext)
}
