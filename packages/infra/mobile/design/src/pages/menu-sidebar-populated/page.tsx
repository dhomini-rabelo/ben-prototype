import { MenuSidebar } from "@/layout/components/menu/menu-sidebar";
import { MenuShell } from "@/layout/components/common/menu-shell";

export function MenuSidebarPopulatedPage() {
  return (
    <MenuShell
      panel={
        <MenuSidebar counts={{ tasks: 3, notes: 12, reminders: 4 }} />
      }
    />
  );
}
