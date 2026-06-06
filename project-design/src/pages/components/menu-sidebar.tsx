import { MenuSidebar } from "@/layout/components/menu-sidebar";
import { ComponentPreview } from "./_preview";

export function MenuSidebarPreview() {
  return (
    <ComponentPreview
      name="MenuSidebar"
      description="Slide-in panel from the leading edge of the chat surface. Four entries (Tasks, Notes, Reminders, Settings) with count badges. Handles loading and error states for badges without blocking navigation."
      variants={[
        {
          label: "Populated",
          node: (
            <div className="w-72">
              <MenuSidebar counts={{ tasks: 3, notes: 12, reminders: 4 }} />
            </div>
          ),
        },
        {
          label: "Loading",
          node: (
            <div className="w-72">
              <MenuSidebar variant="loading" />
            </div>
          ),
        },
        {
          label: "Error",
          node: (
            <div className="w-72">
              <MenuSidebar variant="error" />
            </div>
          ),
        },
      ]}
    />
  );
}
