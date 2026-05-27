import { MenuSidebar } from "../../layout/components/menu-sidebar";
import { MenuShell } from "./_menu-shell";

export function MenuSidebarLoading() {
  return <MenuShell panel={<MenuSidebar variant="loading" />} />;
}
