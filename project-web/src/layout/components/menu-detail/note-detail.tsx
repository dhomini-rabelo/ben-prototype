import { isAxiosError } from "axios";
import { useNoteDetailData } from "@/layout/hooks/api/use-note-detail-data";
import { absoluteDateTime, relativeTime } from "@/layout/utils/format-time";
import { ItemDetailContent } from "./item-detail-content";
import { ItemDetailError } from "./item-detail-error";
import { ItemDetailGone } from "./item-detail-gone";
import { ItemDetailLoading } from "./item-detail-loading";
import { ItemDetailRoot } from "./item-detail-root";

type NoteDetailProps = {
  noteId: string;
  onClose: () => void;
};

export function NoteDetail({ noteId, onClose }: NoteDetailProps) {
  const { actions, state } = useNoteDetailData(noteId);
  const note = state.data?.item;
  const isNotFound =
    isAxiosError(state.error) && state.error.response?.status === 404;
  const isGone = (state.isError && isNotFound) || (!state.isLoading && !state.isError && !note);

  return (
    <ItemDetailRoot kind="note" onClose={onClose}>
      {state.isLoading ? (
        <ItemDetailLoading />
      ) : isGone ? (
        <ItemDetailGone />
      ) : state.isError ? (
        <ItemDetailError onRetry={() => actions.refetch()} />
      ) : note ? (
        <ItemDetailContent
          title={note.title}
          body={note.body}
          capturedAtAbsolute={absoluteDateTime(note.capturedAt)}
          capturedAtRelative={relativeTime(note.capturedAt)}
        />
      ) : null}
    </ItemDetailRoot>
  );
}
