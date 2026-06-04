import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { taskDraftAtom } from "../states/task-workspace-state";
import { useTaskStore } from "../stores/task-store";

export function useWorkspaceInput() {
  const [draft, setDraft] = useAtom(taskDraftAtom);
  const sendText = useTaskStore((store) => store.sendText);

  const handleDraftChange = useCallback(
    (value: string) => setDraft(value),
    [setDraft],
  );

  const handleSend = useAtomCallback(
    useCallback(
      (get, set) => {
        const draft = get(taskDraftAtom);
        set(taskDraftAtom, "");
        void sendText(draft).then((sent) => {
          if (!sent) {
            set(taskDraftAtom, draft);
          }
        });
      },
      [sendText],
    ),
  );

  return { draft, handleDraftChange, handleSend };
}
