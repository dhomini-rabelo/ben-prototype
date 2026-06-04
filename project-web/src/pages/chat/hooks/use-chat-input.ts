import { useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { draftAtom } from "../states/chat-state";
import { useChatStore } from "../states/chat-store";

export function useChatInput() {
  const setDraft = useSetAtom(draftAtom);
  const sendText = useChatStore((store) => store.sendText);

  const handleDraftChange = useCallback(
    (value: string) => setDraft(value),
    [setDraft],
  );

  const handleSend = useAtomCallback(
    useCallback(
      (get, set) => {
        const draft = get(draftAtom);
        set(draftAtom, "");
        void sendText(draft).then((sent) => {
          if (!sent) {
            set(draftAtom, draft);
          }
        });
      },
      [sendText],
    ),
  );

  return { handleDraftChange, handleSend };
}
