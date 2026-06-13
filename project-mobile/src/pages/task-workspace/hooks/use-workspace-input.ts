import { useAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'
import { taskDraftAtom } from '@/pages/task-workspace/states/task-workspace-state'
import { useTaskChatStore } from '@/pages/task-workspace/stores/task-chat-store'

export function useWorkspaceInput() {
  const [draft, setDraft] = useAtom(taskDraftAtom)
  const sendText = useTaskChatStore((store) => store.sendText)

  const handleDraftChange = useCallback(
    (value: string) => setDraft(value),
    [setDraft],
  )

  const handleSend = useAtomCallback(
    useCallback(
      (get, set) => {
        const draft = get(taskDraftAtom)
        set(taskDraftAtom, '')
        void sendText(draft).then((sent) => {
          if (!sent) {
            set(taskDraftAtom, draft)
          }
        })
      },
      [sendText],
    ),
  )

  return { draft, handleDraftChange, handleSend }
}
