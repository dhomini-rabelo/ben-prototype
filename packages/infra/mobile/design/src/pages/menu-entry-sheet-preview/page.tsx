import { MenuEntryList } from "@/layout/components/menu/menu-entry-list";
import { MenuEntrySheet } from "@/layout/components/menu/menu-entry-sheet";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function MenuEntrySheetPreviewPage() {
  return (
    <PreviewShell
      name="MenuEntrySheet"
      description="Sheet that slides up from the bottom of the chat. Four entries (Tasks, Notes, Reminders, Settings) with count badges. The list handles loading and error states for badges without blocking navigation."
      variants={[
        { label: "Sheet", node: <MenuEntrySheet /> },
        {
          label: "List — Populated",
          node: (
            <div className="w-72">
              <MenuEntryList counts={{ tasks: 3, notes: 12, reminders: 5 }} />
            </div>
          ),
        },
        {
          label: "List — Loading",
          node: (
            <div className="w-72">
              <MenuEntryList variant="loading" />
            </div>
          ),
        },
        {
          label: "List — Error",
          node: (
            <div className="w-72">
              <MenuEntryList variant="error" />
            </div>
          ),
        },
      ]}
    />
  );
}
