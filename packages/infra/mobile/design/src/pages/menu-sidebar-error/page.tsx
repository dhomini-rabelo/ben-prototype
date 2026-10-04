import { MenuSidebar } from "@/layout/components/menu/menu-sidebar";
import { MenuShell } from "@/layout/components/common/menu-shell";

export function MenuSidebarErrorPage() {
  return <MenuShell panel={<MenuSidebar variant="error" />} />;
}
