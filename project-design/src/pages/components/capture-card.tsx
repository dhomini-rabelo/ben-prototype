import { CaptureCard } from "../../layout/components/ui/capture-card";
import { ComponentPreview } from "./_preview";

export function CaptureCardPreview() {
  return (
    <ComponentPreview
      name="CaptureCard"
      description="Inline capture inside a Ben bubble. Notes/Reminders open the item-detail modal on tap; Tasks have a Start/Continue/View affordance into the workspace."
      variants={[
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
          label: "Note — error",
          node: (
            <CaptureCard
              kind="note"
              state="error"
              title="Review the migration plan"
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
          label: "Reminder — upcoming",
          node: (
            <CaptureCard
              kind="reminder"
              state="default"
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
          label: "Task — pending (creating)",
          node: (
            <CaptureCard
              kind="task"
              state="pending"
              taskShape="text"
              title="Draft the Q3 brief"
            />
          ),
        },
        {
          label: "Task — not started (text)",
          node: (
            <CaptureCard
              kind="task"
              state="default"
              taskShape="text"
              title="Draft the Q3 brief"
            />
          ),
        },
        {
          label: "Task — not started (list)",
          node: (
            <CaptureCard
              kind="task"
              state="default"
              taskShape="list"
              title="Packing for the offsite"
            />
          ),
        },
        {
          label: "Task — active",
          node: (
            <CaptureCard
              kind="task"
              state="active"
              taskShape="text"
              title="Draft the Q3 brief"
              supportingText="active · 2h ago"
            />
          ),
        },
        {
          label: "Task — finished",
          node: (
            <CaptureCard
              kind="task"
              state="finished"
              taskShape="text"
              title="Draft the Q3 brief"
              supportingText="finished 3h ago"
            />
          ),
        },
        {
          label: "Task — error",
          node: (
            <CaptureCard
              kind="task"
              state="error"
              taskShape="text"
              title="Draft the Q3 brief"
            />
          ),
        },
      ]}
    />
  );
}
