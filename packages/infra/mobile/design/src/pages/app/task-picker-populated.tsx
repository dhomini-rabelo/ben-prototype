import { TaskPickerSheet } from "@/layout/components/task-picker-sheet";
import { PickerShell } from "./_picker-shell";

export function TaskPickerPopulated() {
  return (
    <PickerShell
      sheet={
        <TaskPickerSheet
          variant="populated"
          tasks={[
            {
              id: "1",
              title: "Draft the Q3 brief",
              shape: "text",
              supporting: "just now",
            },
            {
              id: "2",
              title: "Packing for the offsite",
              shape: "list",
              supporting: "active · 2h ago",
            },
            {
              id: "3",
              title: "Rewrite onboarding email sequence",
              shape: "text",
              supporting: "started yesterday",
            },
          ]}
        />
      }
    />
  );
}
