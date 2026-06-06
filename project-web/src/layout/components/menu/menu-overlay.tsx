import { useState } from "react";
import { useNoteListData } from "@/layout/hooks/api/use-note-list-data";
import { useReminderListData } from "@/layout/hooks/api/use-reminder-list-data";
import { useTaskListData } from "@/layout/hooks/api/use-task-list-data";
import { MenuNotesView } from "./menu-notes-view";
import { MenuRemindersView } from "./menu-reminders-view";
import { MenuSidebar, type MenuEntryId } from "./menu-sidebar";
import { MenuTasksView } from "./menu-tasks-view";
import { NoteDetail } from "./note-detail";
import { ReminderDetail } from "./reminder-detail";
import { SettingsView } from "./settings-view";

type MenuOverlayProps = {
  onClose: () => void;
};

type MenuView = "menu" | "tasks" | "notes" | "reminders";

type DetailTarget =
  | { kind: "note"; id: string }
  | { kind: "reminder"; id: string }
  | null;

type CountValue = number | "skeleton" | "dash" | undefined;

function deriveCount(
  isLoading: boolean,
  isError: boolean,
  value: number | undefined,
): CountValue {
  if (isLoading) {
    return "skeleton";
  }
  if (isError) {
    return "dash";
  }
  return value;
}

export function MenuOverlay({ onClose }: MenuOverlayProps) {
  const [view, setView] = useState<MenuView>("menu");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<DetailTarget>(null);

  const tasks = useTaskListData();
  const notes = useNoteListData();
  const reminders = useReminderListData();

  const taskItems = tasks.state.data?.items ?? [];
  const activeTaskCount = taskItems.filter(
    (task) => task.status !== "finished",
  ).length;

  const counts: Partial<Record<MenuEntryId, CountValue>> = {
    tasks: deriveCount(
      tasks.state.isLoading,
      tasks.state.isError,
      activeTaskCount,
    ),
    notes: deriveCount(
      notes.state.isLoading,
      notes.state.isError,
      notes.state.data?.items.length,
    ),
    reminders: deriveCount(
      reminders.state.isLoading,
      reminders.state.isError,
      reminders.state.data?.items.length,
    ),
  };

  function handleSelectEntry(id: MenuEntryId) {
    if (id === "settings") {
      setIsSettingsOpen(true);
      return;
    }
    setView(id);
  }

  function backToMenu() {
    setView("menu");
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-inverse-surface/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="fixed top-0 bottom-0 left-1/2 z-50 flex h-dvh w-full max-w-120 -translate-x-1/2">
        <div className="flex h-full w-[78%] overflow-hidden">
          {view === "menu" && (
            <MenuSidebar counts={counts} onSelect={handleSelectEntry} />
          )}
          {view === "tasks" && <MenuTasksView onBack={backToMenu} />}
          {view === "notes" && (
            <MenuNotesView
              onBack={backToMenu}
              onSelect={(id) => setDetailTarget({ kind: "note", id })}
            />
          )}
          {view === "reminders" && (
            <MenuRemindersView
              onBack={backToMenu}
              onSelect={(id) => setDetailTarget({ kind: "reminder", id })}
            />
          )}
        </div>
      </div>

      {detailTarget && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-inverse-surface/30 backdrop-blur-[1px]"
            onClick={() => setDetailTarget(null)}
          />
          <div className="fixed bottom-0 left-1/2 z-[70] flex w-full max-w-120 -translate-x-1/2 flex-col">
            {detailTarget.kind === "note" ? (
              <NoteDetail
                noteId={detailTarget.id}
                onClose={() => setDetailTarget(null)}
              />
            ) : (
              <ReminderDetail
                reminderId={detailTarget.id}
                onClose={() => setDetailTarget(null)}
              />
            )}
          </div>
        </>
      )}

      {isSettingsOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-inverse-surface/40 backdrop-blur-[1px]"
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="fixed bottom-0 left-1/2 z-[70] flex w-full max-w-120 -translate-x-1/2 flex-col">
            <SettingsView />
          </div>
        </>
      )}
    </>
  );
}
