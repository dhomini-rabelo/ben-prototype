import { MenuSidebar } from "@/layout/components/menu-sidebar";
import { MenuShell } from "./_menu-shell";

export function MenuSidebarPopulated() {
  return (
    <MenuShell
      panel={
        <MenuSidebar counts={{ tasks: 3, notes: 12, reminders: 4 }} />
      }
    />
  );
}
