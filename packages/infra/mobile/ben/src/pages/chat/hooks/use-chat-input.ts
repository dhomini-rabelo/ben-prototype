import { useAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { draftAtom } from '@/pages/chat/states/chat-state'
import { useMessagesStore } from '@/pages/chat/stores/messages-store'

export function useChatInput() {
  const [draft, setDraft] = useAtom(draftAtom)
  const sendText = useMessagesStore((store) => store.sendText)

  const handleDraftChange = useCallback(
    (value: string) => setDraft(value),
    [setDraft],
  )

  const handleSend = useAtomCallback(
    useCallback(
      (get, set) => {
        const draft = get(draftAtom)
        set(draftAtom, '')
        void sendText(draft).then((committed) => {
          if (!committed) {
            set(draftAtom, draft)
          }
        })
      },
      [sendText],
    ),
  )

  return { draft, handleDraftChange, handleSend }
}
