import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ComponentPreview } from "./_preview";

export function CaptureCardPreview() {
  return (
    <ComponentPreview
      name="CaptureCard"
      description="Inline capture inside a Ben bubble. Optimistic — appears without spinners. Three kinds + error retry."
      variants={[
        {
          label: "Reminder",
          node: (
            <CaptureCard
              kind="reminder"
              title="Pick up milk on the way home"
              meta="Today · 6:00 PM"
            />
          ),
        },
        {
          label: "Note",
          node: (
            <CaptureCard
              kind="note"
              title="Try the new pour-over ratio, 1:16"
            />
          ),
        },
        {
          label: "Task",
          node: (
            <CaptureCard
              kind="task"
              title="Draft the Q3 brief"
              meta="Due Fri · 2026-05-29"
            />
          ),
        },
        {
          label: "Save failed",
          node: (
            <CaptureCard
              kind="note"
              title="Review the migration plan"
              state="error"
            />
          ),
        },
      ]}
    />
  );
}
