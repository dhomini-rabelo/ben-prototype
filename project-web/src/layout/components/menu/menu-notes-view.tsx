import { AlertCircle } from "lucide-react";
import { ChatBanner } from "@/layout/components/chat-banner";
import { Typography } from "@/layout/components/ui/typography";
import { useNoteListData } from "@/layout/hooks/api/use-note-list-data";
import { relativeTime } from "@/layout/utils/format-time";
import { MenuListRow } from "./menu-list-row";
import { MenuListShell } from "./menu-list-shell";
import { MenuListLoading } from "./menu-tasks-view";

type MenuNotesViewProps = {
  onBack: () => void;
  onSelect: (noteId: string) => void;
};

export function MenuNotesView({ onBack, onSelect }: MenuNotesViewProps) {
  const { actions, state } = useNoteListData();
  const notes = state.data?.items ?? [];

  return (
    <MenuListShell title="Notes" onBack={onBack}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <div className="pt-4">
          <ChatBanner.Root tone="error">
            <ChatBanner.Icon icon={AlertCircle} />
            <ChatBanner.Text>couldn't load your notes</ChatBanner.Text>
            <ChatBanner.Action label="retry" onClick={() => actions.refetch()} />
          </ChatBanner.Root>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Typography variant="body-md" className="text-on-surface">
            no notes yet
          </Typography>
          <Typography variant="body-md" className="mt-1 text-on-surface-variant">
            talk to Ben — he'll save the keepers.
          </Typography>
        </div>
      ) : (
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
      )}
    </MenuListShell>
  );
}
