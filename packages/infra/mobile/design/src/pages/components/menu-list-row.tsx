import { MenuListRow } from "@/layout/components/menu-list-row";
import { ComponentPreview } from "./_preview";

export function MenuListRowPreview() {
  return (
    <ComponentPreview
      name="MenuListRow"
      description="Row used in the menu's Tasks, Notes, and Reminders lists. Shape icon, title, optional body preview and supporting line, optional trailing relative-time. Muted variant for finished/fired rows."
      variants={[
        {
          label: "Task — active",
          node: (
            <div className="w-full">
              <MenuListRow
                kind="task-text"
                title="Draft the Q3 brief"
                supporting="active · just now"
              />
            </div>
          ),
        },
        {
          label: "Task — finished (muted)",
          node: (
            <div className="w-full">
              <MenuListRow
                kind="task-list"
                title="Grocery list — weekend"
                supporting="finished yesterday"
                muted
              />
            </div>
          ),
        },
        {
          label: "Note — with body preview",
          node: (
            <div className="w-full">
              <MenuListRow
                kind="note"
                title="Try 1:16 pour-over ratio this week"
                bodyPreview="lighter ratio on the Ethiopia bag — past the third pour, slow agitation…"
                trailing="today"
              />
            </div>
          ),
        },
        {
          label: "Reminder — upcoming",
          node: (
            <div className="w-full">
              <MenuListRow
                kind="reminder"
                title="Call dad"
                trailing="in 2h"
                emphasizeTrailing
                supporting="captured 10m ago"
              />
            </div>
          ),
        },
        {
          label: "Reminder — fired (muted)",
          node: (
            <div className="w-full">
              <MenuListRow
                kind="reminder"
                title="Stretch break"
                trailing="3h ago"
                supporting="fired"
                muted
              />
            </div>
          ),
        },
      ]}
    />
  );
}
