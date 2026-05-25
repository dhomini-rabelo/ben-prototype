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
        {
          label: "Note — pending",
          node: (
            <CaptureCard
              kind="note"
              state="pending"
              title="Try 1:16 pour-over ratio this week"
            />
          ),
        },
        {
          label: "Note — saved",
          node: (
            <CaptureCard
              kind="note"
              state="default"
              title="Try 1:16 pour-over ratio this week"
            />
          ),
        },
        {
          label: "Reminder — pending",
          node: (
            <CaptureCard
              kind="reminder"
              state="pending"
              title="Call mom"
              meta="in 2h"
            />
          ),
        },
        {
          label: "Reminder — fired",
          node: (
            <CaptureCard
              kind="reminder"
              state="fired"
              title="Call mom"
              meta="3h ago"
            />
          ),
        },
        {
          label: "Task — open",
          node: (
            <CaptureCard
              kind="task"
              state="default"
              title="Draft the Q3 brief"
              onToggle={() => {}}
            />
          ),
        },
        {
          label: "Task — done",
          node: (
            <CaptureCard
              kind="task"
              state="done"
              title="Draft the Q3 brief"
              onToggle={() => {}}
            />
          ),
        },
        {
          label: "Task — pending",
          node: (
            <CaptureCard
              kind="task"
              state="pending"
              title="Draft the Q3 brief"
            />
          ),
        },
        {
          label: "Error — reminder",
          node: (
            <CaptureCard
              kind="reminder"
              state="error"
              title="Call mom"
            />
          ),
        },
        {
          label: "Error — task",
          node: (
            <CaptureCard
              kind="task"
              state="error"
              title="Draft the Q3 brief"
            />
          ),
        },
      ]}
    />
  );
}
