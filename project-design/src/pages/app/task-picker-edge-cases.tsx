import { TaskPickerSheet } from "../../layout/components/task-picker-sheet";
import { PickerShell } from "./_picker-shell";

export function TaskPickerEdgeCases() {
  return (
    <PickerShell
      sheet={
        <TaskPickerSheet
          variant="populated"
          long
          tasks={[
            { id: "1", title: "Draft the Q3 brief", shape: "text", supporting: "just now" },
            { id: "2", title: "Packing for the offsite", shape: "list", supporting: "active · 2h ago" },
            { id: "3", title: "Rewrite onboarding email sequence", shape: "text", supporting: "started yesterday" },
            { id: "4", title: "Annual review notes", shape: "text", supporting: "active · 2d ago" },
            { id: "5", title: "Grocery list — weekend", shape: "list", supporting: "active · 3d ago" },
            { id: "6", title: "Refactor billing module", shape: "text", supporting: "started last week" },
            { id: "7", title: "Conference talk outline", shape: "list", supporting: "active · 5d ago" },
            { id: "8", title: "Design review feedback", shape: "text", supporting: "active · 1w ago" },
          ]}
        />
      }
    />
  );
}
