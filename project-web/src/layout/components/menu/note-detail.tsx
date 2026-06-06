import { isAxiosError } from "axios";
import { useNoteDetailData } from "@/layout/hooks/api/use-note-detail-data";
import { absoluteDateTime, relativeTime } from "@/layout/utils/format-time";
import { ItemDetailSheet } from "./item-detail-sheet";

type NoteDetailProps = {
  noteId: string;
  onClose: () => void;
};

export function NoteDetail({ noteId, onClose }: NoteDetailProps) {
  const { actions, state } = useNoteDetailData(noteId);
  const note = state.data?.item;

  if (state.isLoading) {
    return <ItemDetailSheet kind="note" variant="loading" onClose={onClose} />;
  }

  if (state.isError) {
    const isGone = isAxiosError(state.error) && state.error.response?.status === 404;
    return (
      <ItemDetailSheet
        kind="note"
        variant={isGone ? "gone" : "error"}
        onClose={onClose}
        onRetry={() => actions.refetch()}
      />
    );
  }

  if (!note) {
    return <ItemDetailSheet kind="note" variant="gone" onClose={onClose} />;
  }

  return (
    <ItemDetailSheet
      kind="note"
      title={note.title}
      body={note.body}
      capturedAtAbsolute={absoluteDateTime(note.capturedAt)}
      capturedAtRelative={relativeTime(note.capturedAt)}
      onClose={onClose}
    />
  );
}
