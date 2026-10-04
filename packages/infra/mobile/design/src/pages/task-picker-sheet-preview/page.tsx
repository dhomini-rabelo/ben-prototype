import { TaskPickerSheet } from "@/layout/components/workspace/task-picker-sheet";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function TaskPickerSheetPreviewPage() {
  return (
    <PreviewShell
      name="TaskPickerSheet"
      description="Sheet that slides up from the active-task peek. Lists in-progress tasks in reverse-chronological order; handles empty, loading, and error states inline."
      variants={[
        {
          label: "Populated",
          node: (
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
          ),
        },
        { label: "Empty", node: <TaskPickerSheet variant="empty" /> },
        { label: "Loading", node: <TaskPickerSheet variant="loading" /> },
        { label: "Error", node: <TaskPickerSheet variant="error" /> },
      ]}
    />
  );
}
