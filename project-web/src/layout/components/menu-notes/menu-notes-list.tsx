import type { NoteListItem } from "@/api/models/note";
import { MenuListRow } from "@/layout/components/menu-list/menu-list-row";
import { relativeTime } from "@/layout/utils/format-time";

type MenuNotesListProps = {
  notes: NoteListItem[];
  onSelect: (noteId: string) => void;
};

export function MenuNotesList({ notes, onSelect }: MenuNotesListProps) {
  return (
    <div className="flex flex-col pt-2">
      {notes.map((note) => (
        <MenuListRow
          key={note.id}
          kind="note"
          title={note.title}
          bodyPreview={note.body}
          trailing={relativeTime(note.capturedAt)}
          onClick={() => onSelect(note.id)}
        />
      ))}
    </div>
  );
}
