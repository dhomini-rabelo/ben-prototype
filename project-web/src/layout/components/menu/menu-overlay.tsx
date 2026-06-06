import { NoteDetail } from "@/layout/components/menu-detail/note-detail";
import { ReminderDetail } from "@/layout/components/menu-detail/reminder-detail";
import { MenuNotesView } from "@/layout/components/menu-notes/menu-notes-view";
import { MenuRemindersView } from "@/layout/components/menu-reminders/menu-reminders-view";
import { SettingsView } from "@/layout/components/menu-settings/settings-view";
import { MenuTasksView } from "@/layout/components/menu-tasks/menu-tasks-view";
import { useMenuStore } from "@/layout/stores/menu-store";
import { useEffect } from "react";
import { MenuSidebar } from "./menu-sidebar";

type MenuOverlayProps = {
  onClose: () => void;
};

export function MenuOverlay({ onClose }: MenuOverlayProps) {
  const view = useMenuStore((store) => store.view);
  const detailTargetKind = useMenuStore((store) => store.detailTarget?.kind);
  const detailTargetId = useMenuStore((store) => store.detailTarget?.id);
  const isSettingsOpen = useMenuStore((store) => store.isSettingsOpen);
  const closeDetail = useMenuStore((store) => store.closeDetail);
  const closeSettings = useMenuStore((store) => store.closeSettings);
  const reset = useMenuStore((store) => store.reset);

  useEffect(() => () => reset(), [reset]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-inverse-surface/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="fixed top-0 bottom-0 left-1/2 z-50 flex h-dvh w-full max-w-120 -translate-x-1/2">
        <div className="flex h-full w-[78%] overflow-hidden">
          {view === "menu" && <MenuSidebar />}
          {view === "tasks" && <MenuTasksView />}
          {view === "notes" && <MenuNotesView />}
          {view === "reminders" && <MenuRemindersView />}
        </div>
      </div>

      {detailTargetKind && detailTargetId && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-inverse-surface/30 backdrop-blur-[1px]"
            onClick={closeDetail}
          />
          <div className="fixed bottom-0 left-1/2 z-[70] flex w-full max-w-120 -translate-x-1/2 flex-col">
            {detailTargetKind === "note" ? (
              <NoteDetail noteId={detailTargetId} onClose={closeDetail} />
            ) : (
              <ReminderDetail
                reminderId={detailTargetId}
                onClose={closeDetail}
              />
            )}
          </div>
        </>
      )}

      {isSettingsOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-inverse-surface/40 backdrop-blur-[1px]"
            onClick={closeSettings}
          />
          <div className="fixed bottom-0 left-1/2 z-[70] flex w-full max-w-120 -translate-x-1/2 flex-col">
            <SettingsView />
          </div>
        </>
      )}
    </>
  );
}
